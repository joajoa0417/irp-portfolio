# utils.py
import pandas as pd
import numpy as np

def calculate_investor_score(user_answers: dict, investor_df: pd.DataFrame) -> float:
    total_score = 0.0
    investor_items = ["기대수익률", "투자성향설문", "20%손실감내", "주식펀드비중", "투자상품경험"]

    for item in investor_items:
        if item in user_answers:
            answers = user_answers[item]
            if isinstance(answers, str) and "," in answers:
                answers = [ans.strip() for ans in answers.split(",")]
            if isinstance(answers, list):
                for ans in answers:
                    match = investor_df[(investor_df["항목명"] == item) & (investor_df["조건값"] == ans)]
                    if not match.empty:
                        total_score += float(match.iloc[0]["투자성향 점수"])
            else:
                match = investor_df[(investor_df["항목명"] == item) & (investor_df["조건값"] == answers)]
                if not match.empty:
                    total_score += float(match.iloc[0]["투자성향 점수"])
    return total_score

def calculate_A_from_survey(user, weight_df: pd.DataFrame, investor_df: pd.DataFrame):
    A = 0.0
    warnings = []

    raw_score = calculate_investor_score(user.answers, investor_df)
    investor_score = round(raw_score, 2)

    if investor_score == 0:
        investor_level = 0
    elif investor_score <= 1:
        investor_level = 1
    elif investor_score <= 2:
        investor_level = 2
    elif investor_score <= 3:
        investor_level = 3
    else:
        investor_level = 4

    A += investor_level
    user.answers["투자성향"] = investor_level

    age_row = weight_df[weight_df["연령대"] == user.age_group]
    if not age_row.empty:
        A += float(age_row.iloc[0]["연령대 점수"])

    exclude_items = ["기대수익률", "투자성향설문", "20%손실감내", "주식펀드비중", "투자상품경험"]

    for item_name, user_answer in user.answers.items():
        if item_name in exclude_items:
            continue
        if item_name == "투자성향" and isinstance(user_answer, int):
            continue

        valid_values = weight_df[(weight_df["연령대"] == user.age_group) & (weight_df["항목명"] == item_name)]["조건값"].unique().tolist()

        if user_answer not in valid_values:
            warnings.append({"항목": item_name, "입력값": user_answer, "허용값": valid_values})
            continue

        match_row = weight_df[(weight_df["연령대"] == user.age_group) & (weight_df["항목명"] == item_name) & (weight_df["조건값"] == user_answer)]

        if not match_row.empty:
            try:
                score = float(match_row.iloc[0]["조건값 점수"])
                A += score
            except Exception as e:
                warnings.append({"항목": item_name, "오류": str(e)})

    return round(A, 2), warnings, investor_score

def filter_best_principal_products_by_age_cumsum(principal_df: pd.DataFrame, user_age: int, cumsum_threshold: float = 0.7, max_count: int = 5) -> pd.DataFrame:
    principal_df = principal_df.copy()
    principal_df['연 금리(%)'] = pd.to_numeric(principal_df['연 금리(%)'], errors='coerce')
    filtered_df = principal_df.dropna(subset=['연 금리(%)'])

    if user_age >= 50:
        filtered_df = filtered_df[
            (filtered_df['상품종류'].str.contains("정기예금")) &
            (filtered_df['만기'].astype(str).str.contains("6개월"))
        ]
    elif user_age >= 40:
        filtered_df = filtered_df[filtered_df['상품종류'].str.contains("저축은행정기예금")]

    if filtered_df.empty:
        print(f"[WARN] 나이 {user_age} 조건에 맞는 상품 없음 → 전체 상품에서 재선택")
        filtered_df = principal_df.dropna(subset=['연 금리(%)'])

    filtered_df['기본상품명'] = filtered_df['상품명'].apply(lambda x: x.split('(')[0].strip())
    best_per_base = filtered_df.loc[filtered_df.groupby('기본상품명')['연 금리(%)'].idxmax()]
    best_per_base = best_per_base.sort_values(by='연 금리(%)', ascending=False).reset_index(drop=True)

    best_per_base['누적비율'] = best_per_base['연 금리(%)'].cumsum() / best_per_base['연 금리(%)'].sum()
    result = best_per_base[best_per_base['누적비율'] <= cumsum_threshold]
    if len(result) > max_count:
        result = result.head(max_count)
    return result

def get_alpha_by_A(A):
    if A >= 9.0:
        return 1.5
    elif A >= 7.0:
        return 1.2
    elif A >= 5.0:
        return 0.9
    elif A >= 3.0:
        return 0.6
    elif A >= 1.0:
        return 0.3
    else:
        return 0.1

def adjust_fund_selection_by_A(fund_df: pd.DataFrame, A: float, top_n: int = 5) -> pd.DataFrame:
    fund_df = fund_df.copy()
    if '지수_연환산수익률' in fund_df.columns and '지수_연환산변동성' in fund_df.columns:
        fund_df['수익률'] = pd.to_numeric(fund_df['지수_연환산수익률'], errors='coerce')
        fund_df['변동성'] = pd.to_numeric(fund_df['지수_연환산변동성'], errors='coerce')
    elif '수익률' in fund_df.columns and '변동성' in fund_df.columns:
        fund_df['수익률'] = pd.to_numeric(fund_df['수익률'], errors='coerce')
        fund_df['변동성'] = pd.to_numeric(fund_df['변동성'], errors='coerce')
    else:
        raise ValueError("펀드 데이터에 필요한 수익률/변동성 컬럼이 없습니다.")

    fund_df = fund_df.dropna(subset=['수익률', '변동성'])
    fund_df['효용점수'] = fund_df['수익률'] - A * fund_df['변동성']
    fund_df = fund_df.sort_values(by='효용점수', ascending=False)
    return fund_df.head(top_n)
