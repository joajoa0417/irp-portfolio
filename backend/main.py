# main.py
import matplotlib
matplotlib.use("Agg")
matplotlib.rcParams["font.family"] = "Malgun Gothic"

import logging
from io import BytesIO
import os
import pandas as pd
import matplotlib.pyplot as plt
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Dict
from fastapi.responses import JSONResponse

from utils import calculate_A_from_survey, filter_best_principal_products_by_age_cumsum
from optimizer import calculate_er_sigma, optimize_portfolio, get_alpha_by_A

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

origins = ["https://irp-portfolio.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 🔥 * 말고 명시
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
DATA_DIR = 'data'
principal_df = pd.read_csv(os.path.join(DATA_DIR, 'irp.csv'), encoding='utf-8')
non_principal_df = pd.read_csv(os.path.join(DATA_DIR, 'update_irp_non_with_index.csv'))
risk_weight_df = pd.read_csv(os.path.join(DATA_DIR, 'final_weight_table.csv'), encoding='utf-8')
investor_df = pd.read_csv(os.path.join(DATA_DIR, 'invest_score.csv'), encoding='utf-8')

@app.get("/")
def read_root():
    logger.info(":white_check_mark: FastAPI 서버 시작됨!")
    return {"message": "Welcome to the IRP Portfolio Recommendation API"}

class UserInput(BaseModel):
    age_group: str = Field(..., example="30대(35~39세)")
    answers: Dict[str, str] = Field(...)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.options("/recommend")
async def options_recommend(request: Request):
    response = JSONResponse(content={"message": "ok"})
    response.headers["Access-Control-Allow-Origin"] = "https://irp-portfolio.vercel.app"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.post("/recommend")
def recommend(user: UserInput):
    try:
        logger.info("[INPUT] %s", user.answers)
        A, warnings, investor_score = calculate_A_from_survey(user, risk_weight_df, investor_df)
        logger.info("[CALCULATED A]: %.2f, [INVESTOR SCORE]: %.2f", A, investor_score)

        investment_type = user.answers.get("투자성향설문")
        target_risky_mapping = {
            "안정형": 0.0,
            "안정추구형": 0.2,
            "중립투자형": 0.4,
            "적극투자형": 0.6,
            "공격투자형": 0.7
        }
        target_risky_ratio = target_risky_mapping.get(investment_type, 0.7)

        results = []

        if investment_type == "안정형":
            logger.info("안정형 투자자 - 예금 상품 선택 중")
            age_match = re.search(r'\d+', user.age_group)
            user_age = int(age_match.group()) if age_match else 30

            selected_deposits = filter_best_principal_products_by_age_cumsum(principal_df, user_age, cumsum_threshold=0.9)
            total_rate = selected_deposits['연 금리(%)'].sum()

            for _, row in selected_deposits.iterrows():
                weight = row['연 금리(%)'] / total_rate if total_rate > 0 else 1 / len(selected_deposits)
                results.append({"asset": f"예금_{row['상품명']}", "weight": round(weight, 4)})

            response_data = {
                "calculated_A": A,
                "investor_score": investor_score,
                "target_risky_ratio": target_risky_ratio,
                "alpha": get_alpha_by_A(A),
                "portfolio": results,
                "warnings": warnings
            }

            response = JSONResponse(content=response_data)
            response.headers["Access-Control-Allow-Origin"] = "https://irp-portfolio.vercel.app"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response

        alpha = get_alpha_by_A(A)
        ER, Sigma, asset_names, principal_asset_indices, non_principal_asset_indices = calculate_er_sigma(
            principal_df, non_principal_df, A, user)
        portfolio_weights, _ = optimize_portfolio(
            ER, Sigma, A, principal_asset_indices, non_principal_asset_indices, target_risky_ratio, alpha)

        results = [
            {"asset": name, "weight": round(w, 4)}
            for name, w in zip(asset_names, portfolio_weights) if w > 0.001
        ]

        response_data = {
            "calculated_A": A,
            "investor_score": investor_score,
            "target_risky_ratio": target_risky_ratio,
            "alpha": alpha,
            "portfolio": results,
            "warnings": warnings
        }

        response = JSONResponse(content=response_data)
        response.headers["Access-Control-Allow-Origin"] = "https://irp-portfolio.vercel.app"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plot")
def plot_pie(user: UserInput):
    try:
        A, warnings, investor_score = calculate_A_from_survey(user, risk_weight_df, investor_df)
        investment_type = user.answers.get("투자성향설문")
        target_risky_mapping = {
            "안정형": 0.0,
            "안정추구형": 0.2,
            "중립투자형": 0.4,
            "적극투자형": 0.6,
            "공격투자형": 0.7
        }
        target_risky_ratio = target_risky_mapping.get(investment_type, 0.7)

        names, values = [], []

        if investment_type == "안정형":
            logger.info("안정형 투자자 - 예금 플롯 생성 중")
            age_match = re.search(r'\d+', user.age_group)
            user_age = int(age_match.group()) if age_match else 30
            selected_deposits = filter_best_principal_products_by_age_cumsum(principal_df, user_age, cumsum_threshold=0.9)
            total_rate = selected_deposits['연 금리(%)'].sum()
            for _, row in selected_deposits.iterrows():
                names.append(f"예금_{row['상품명']}")
                weight = row['연 금리(%)'] / total_rate if total_rate > 0 else 1 / len(selected_deposits)
                values.append(weight)
        else:
            alpha = get_alpha_by_A(A)
            ER, Sigma, asset_names_all, principal_asset_indices, non_principal_asset_indices = calculate_er_sigma(principal_df, non_principal_df, A, user)
            portfolio_weights, _ = optimize_portfolio(ER, Sigma, A, principal_asset_indices, non_principal_asset_indices, target_risky_ratio, alpha)
            for name, w in zip(asset_names_all, portfolio_weights):
                if w > 0.01:
                    names.append(name)
                    values.append(w)

        if not names:
            raise HTTPException(status_code=400, detail="포트폴리오 플롯을 생성할 자산이 없습니다.")

        fig, ax = plt.subplots(figsize=(6, 6))

        def shorten_label(name):
            return name[:18] + "…" if len(name) > 20 else name

        display_names = [shorten_label(name) for name in names]
        total = sum(values)
        values = [v / total for v in values] if total > 0 else values

        ax.pie(values, labels=display_names, autopct='%1.1f%%', startangle=90)
        ax.axis('equal')
        plt.title("추천 포트폴리오 자산 비중")

        buf = BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight")
        buf.seek(0)
        plt.close()
        return StreamingResponse(buf, media_type="image/png")

    except Exception as e:
        logger.error("[ERROR] /plot 에러: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))
