# optimizer.py
import numpy as np
import pandas as pd
from scipy.optimize import minimize
import yfinance as yf

# 효용 함수
def utility_function(weights, ER, Sigma, A, alpha=0.5):
    portfolio_return = np.dot(weights, ER)
    portfolio_variance = np.dot(weights.T, np.dot(Sigma, weights))
    diversification_penalty = 1 - np.var(weights)
    return - (portfolio_return - alpha * A * portfolio_variance) + diversification_penalty * 0.5

# 자산 비중
def get_bounds(num_assets):
    return tuple((0, 1.0) for _ in range(num_assets))

# 제약 조건 설정
def get_constraints(principal_asset_indices, non_principal_asset_indices, target_risky_ratio=0.7):
    constraints = [
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0},  # 자산 비중 합이 1이어야 함
    ]
    constraints.append(
        {'type': 'eq', 'fun': lambda x: np.sum([x[i] for i in non_principal_asset_indices]) - target_risky_ratio}
    )

    return constraints

# A 값 기반 알파
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
    
# 포트폴리오 최적화
def optimize_portfolio(ER, Sigma, A, principal_asset_indices, non_principal_asset_indices, target_risky_ratio=0.7, alpha=None):
    num_assets = len(ER)
    if alpha is None:
        alpha = get_alpha_by_A(A)

    IRP_MAX = 0.7 # IRP 규정 상한

    # target_risky_ratio가 IRP_MAX를 초과하지 않도록 보정
    adjusted_target_risky_ratio = min(target_risky_ratio, IRP_MAX)
    if target_risky_ratio > IRP_MAX:
        print(f"[WARN] 요청된 비보장형 상품 비중 {target_risky_ratio:.2f}가 IRP 허용 최대 {IRP_MAX:.2f}를 초과 → {IRP_MAX:.2f}로 조정")
    
    print(f"[DEBUG] A: {A:.2f}, alpha: {alpha:.2f}, 목표 비보장형 비중: {adjusted_target_risky_ratio:.2f}")
    print(f"[DEBUG] 보장형 자산 인덱스: {principal_asset_indices}")
    print(f"[DEBUG] 비보장형 자산 인덱스: {non_principal_asset_indices}")

    # 초기 가중치
    initial_weights = np.random.rand(num_assets)
    initial_weights /= np.sum(initial_weights)

    result = minimize(
        fun=utility_function,
        x0=initial_weights,
        args=(ER, Sigma, A, alpha),
        method='SLSQP',
        bounds=get_bounds(num_assets),
        constraints=get_constraints(principal_asset_indices, non_principal_asset_indices, adjusted_target_risky_ratio), # 변경된 제약 함수 호출
        options={'disp': False}
    )

    if result.success:
        return result.x, result
    else:
        print("[FALLBACK] 최적화 실패 → 목표 비중에 따른 강제 분산")
        weights = np.zeros(num_assets)
        
        # 비보장형 자산 비중 할당
        if non_principal_asset_indices:
            weight_per_non_principal_asset = adjusted_target_risky_ratio / len(non_principal_asset_indices)
            for i in non_principal_asset_indices:
                weights[i] = weight_per_non_principal_asset
        
        # 보장형 자산 비중 할당 (1 - 비보장형 총 비중)
        if principal_asset_indices:
            weight_per_principal_asset = (1.0 - adjusted_target_risky_ratio) / len(principal_asset_indices)
            for i in principal_asset_indices:
                weights[i] = weight_per_principal_asset
        
        # 합계가 1이 되지 않을 수 있으므로 마지막에 정규화
        if np.sum(weights) > 0:
            weights /= np.sum(weights)
            
        print(f"[FALLBACK] 생성된 가중치: {weights}")
        return weights, None



# 기대수익률 및 공분산 행렬 계산
def calculate_er_sigma(principal_df, non_principal_df, A, user):
    all_asset_names = []
    asset_expected_returns = []
    asset_std_devs = []
    
    principal_asset_indices = []
    non_principal_asset_indices = []
    
    # principal_df (예금 상품) 처리
    if not principal_df.empty:
        principal_df['연 금리(%)'] = pd.to_numeric(principal_df['연 금리(%)'], errors='coerce')
        filtered_principal_df = principal_df.dropna(subset=['연 금리(%)'])

        if not filtered_principal_df.empty:
            import re
            age_num_match = re.search(r'\d+', user.age_group)
            user_age = int(age_num_match.group()) if age_num_match else 30  # 기본값 30

            if user_age >= 50:
                age_filtered = filtered_principal_df[
                    (filtered_principal_df['상품종류'].str.contains("정기예금")) &
                    (filtered_principal_df['만기'].astype(str).str.contains("6개월"))
                ]
            elif user_age >= 40:
                age_filtered = filtered_principal_df[
                    filtered_principal_df['상품종류'].str.contains("저축은행정기예금")
                ]
            else:
                age_filtered = filtered_principal_df

            if age_filtered.empty:
                print(f"[WARN] 나이 {user_age}세 조건을 만족하는 보장형 상품이 없습니다. 전체 상품에서 다시 선택합니다.")
                age_filtered = filtered_principal_df  

            def extract_base_product_name(product_name):
                return product_name.split('(')[0].strip()

            age_filtered['기본상품명'] = age_filtered['상품명'].apply(extract_base_product_name)

            best_per_base_product = age_filtered.loc[
                age_filtered.groupby('기본상품명')['연 금리(%)'].idxmax()
            ]

            for _, row in best_per_base_product.iterrows():
                asset_name = f"예금_{row['상품명']}"
                all_asset_names.append(asset_name)
                principal_asset_indices.append(len(all_asset_names) - 1)
                rate = row['연 금리(%)'] / 100.0
                asset_expected_returns.append(rate)
                asset_std_devs.append(0.001)
        else:
            print("[WARN] 유효한 연 금리 데이터가 있는 예금 상품을 찾을 수 없습니다.")
    else:
        print("[WARN] principal_df가 비어있습니다.")

    # non_principal_df (펀드 상품) 처리
    fund_categories = [] # 펀드 카테고리를 저장할 리스트
    for idx, row in non_principal_df.iterrows():
        asset_name = f"펀드_{row['상품명']}"
        all_asset_names.append(asset_name)
        non_principal_asset_indices.append(len(all_asset_names) - 1)
        
        # 펀드 기대수익률 및 표준편차 계산
        expected_return = 0.0
        return_found = False
        return_period_configs = [('3년', 3), ('2년', 2), ('1년', 1), ('6개월', 0.5), ('3개월', 0.25), ('1개월', 1/12)]
        for search_key, years_fraction in return_period_configs:
            for full_col_name in row.index:
                if search_key in full_col_name and '수익률' in full_col_name:
                    val = pd.to_numeric(row[full_col_name], errors='coerce')
                    if pd.notna(val):
                        expected_return = (1 + val / 100) ** (1 / years_fraction) - 1
                        return_found = True
                        break
            if return_found:
                break
        expected_return = max(expected_return, 0.01)
        asset_expected_returns.append(expected_return)

        std_candidates = []
        for col_suffix in ['1개월', '3개월', '6개월', '1년']:
            for full_col_name in row.index:
                if col_suffix in full_col_name and '수익률' in full_col_name:
                    val = pd.to_numeric(row[full_col_name], errors='coerce')
                    if pd.notna(val):
                        std_candidates.append(val / 100)

        std_dev = max(np.std(std_candidates), 0.01) if std_candidates else 0.15
        asset_std_devs.append(std_dev)

        # --- 펀드 카테고리 분류 로직 추가 ---
        fund_name_lower = row['상품명'].lower()
        if '주식' in fund_name_lower:
            if '글로벌' in fund_name_lower or '해외' in fund_name_lower:
                fund_categories.append('글로벌주식')
            else:
                fund_categories.append('국내주식')
        elif '채권' in fund_name_lower:
            if '글로벌' in fund_name_lower or '해외' in fund_name_lower:
                fund_categories.append('글로벌채권')
            else:
                fund_categories.append('국내채권')
        elif '혼합' in fund_name_lower:
            fund_categories.append('혼합형')
        else:
            fund_categories.append('기타펀드') # 분류되지 않은 펀드

    ER = np.array(asset_expected_returns)
    stds = np.array(asset_std_devs)

    num_assets = len(all_asset_names)
    corr_matrix = np.eye(num_assets)

    # --- 상관관계 행렬 계산 로직 개선 ---
    for p_idx in principal_asset_indices:
        for np_idx in non_principal_asset_indices:
            corr_matrix[p_idx, np_idx] = 0.0
            corr_matrix[np_idx, p_idx] = 0.0

    # 펀드 그룹별 상관관계 설정 (비보장형 자산들 간의 상관관계)

    non_principal_fund_categories = [fund_categories[i - len(principal_asset_indices)] for i in non_principal_asset_indices]

    correlation_rules = {
        ('국내주식', '국내주식'): 0.8,
        ('글로벌주식', '글로벌주식'): 0.8,
        ('국내채권', '국내채권'): 0.7,
        ('글로벌채권', '글로벌채권'): 0.7,
        ('혼합형', '혼합형'): 0.6,
        
        ('국내주식', '글로벌주식'): 0.6,
        ('국내채권', '글로벌채권'): 0.5,
        
        ('국내주식', '국내채권'): 0.2,
        ('글로벌주식', '글로벌채권'): 0.2,
        ('국내주식', '혼합형'): 0.5,
        ('국내채권', '혼합형'): 0.4,
    }

    for i in range(len(non_principal_asset_indices)):
        for j in range(i + 1, len(non_principal_asset_indices)):
            idx_i = non_principal_asset_indices[i]
            idx_j = non_principal_asset_indices[j]
            
            cat_i = non_principal_fund_categories[i]
            cat_j = non_principal_fund_categories[j]

            # 두 카테고리 조합에 맞는 상관관계 찾기
            corr_val = correlation_rules.get((cat_i, cat_j), correlation_rules.get((cat_j, cat_i), 0.3)) # 기본값 0.3
            
            # 주식-채권처럼 특정 조합은 더 낮은 상관관계
            if ('주식' in cat_i and '채권' in cat_j) or ('채권' in cat_i and '주식' in cat_j):
                corr_val = 0.15 # 더 낮은 상관관계
            elif ('주식' in cat_i and '주식' in cat_j) or ('채권' in cat_i and '채권' in cat_j):
                pass # 이미 위에서 설정된 높은 값 사용
            
            corr_matrix[idx_i, idx_j] = corr_val
            corr_matrix[idx_j, idx_i] = corr_val

    Sigma = np.outer(stds, stds) * corr_matrix

    return ER, Sigma, all_asset_names, principal_asset_indices, non_principal_asset_indices
