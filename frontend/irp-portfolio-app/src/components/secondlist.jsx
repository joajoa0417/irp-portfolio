export const advancedSurveyQuestions = [
  {
    id: "age",
    question: "연령이 어떻게 되시나요? (만 나이 기준)",
    type: "text",
    placeholder: "예: 35",
  },
  {
    id: "job",
    question: "직업은 무엇인가요?",
    options: [
      { value: "employee", label: "직장인" },
      { value: "professional", label: "전문직" },
      { value: "self_employed", label: "자영업자" },
      { value: "freelancer", label: "프리랜서" },
      { value: "retired", label: "퇴직자" },
    ],
  },
  {
    id: "income",
    question: "연간 소득은 얼마인가요?",
    options: [
      { value: "under_30m", label: "3000만원 미만" },
      { value: "30m_50m", label: "3000만원 이상 ~ 5000만원 미만" },
      { value: "50m_70m", label: "5000만원 이상 ~ 7000만원 미만" },
      { value: "70m_100m", label: "7000만원 이상 ~ 1억원 미만" },
      { value: "over_100m", label: "1억원 이상" },
    ],
  },
  {
    id: "expected_return",
    question: "기대 수익률은 어떻게 되나요?",
    options: [
      { value: "plus_minus_5", label: "원금기준 ± 5%" },
      { value: "plus_minus_10", label: "원금기준 ± 10%" },
      { value: "plus_minus_20", label: "원금기준 ± 20%" },
      { value: "over_20", label: "원금기준 ± 20% 초과" },
    ],
  },
  {
    id: "invest_type",
    question: "투자 성향이 어떻게 되시나요?",
    options: [
      { value: "conservative", label: "안정형" },
      { value: "conservative_seek", label: "안정추구형" },
      { value: "neutral", label: "중립투자형" },
      { value: "aggressive", label: "적극투자형" },
      { value: "offensive", label: "공격투자형" },
    ],
  },
  {
    id: "loss_response",
    question: "투자금이 일시적으로 20% 손실 났을 때 나의 반응은?",
    options: [
      { value: "cut_loss", label: "바로 손절한다" },
      { value: "wait", label: "고민해보겠지만 어느 정도 기다린다" },
      { value: "buy_more", label: "추가 매수하고 장기 보유한다" },
    ],
  },
  {
    id: "stock_fund_ratio",
    question:
      "전체 자산 중 주식이나 펀드 등의 금융 상품에 얼마나 투자하고 있나요?",
    options: [
      { value: "under_20", label: "20% 미만" },
      { value: "20_40", label: "20% 이상 - 40% 미만" },
      { value: "40_60", label: "40% 이상 - 60% 미만" },
      { value: "over_60", label: "60% 초과" },
    ],
  },
  {
    id: "product_experience",
    question: "이 중에 투자 경험이 있는 상품이 있나요? (복수 응답 가능)",
    type: "checkbox",
    options: [
      {
        value: "deposit_savings",
        label: "은행 예금이나 적금, 국채, 지방채, 보증채, MMF 등",
      },
      {
        value: "high_grade_bond_els",
        label: "금융채, 신용도가 높은 회사채, 채권형펀드, 원금 보장형 ELS 등",
      },
      {
        value: "mid_grade_bond_els",
        label:
          "신용등 중간 등급의 회사채, 원금의 일부만 보장하는 ELS, 혼합형 펀드 등",
      },
      {
        value: "low_grade_stock",
        label:
          "신용도가 낮은 회사채, 주식, 원금이 보장되지 않는 ELS, 시장수익을 추구하는 주식형펀드 등",
      },
      {
        value: "derivatives",
        label:
          "ELW, 선물옵션, 시장수익율 이상의 수익을 추구하는 주식형펀드, 파생상품펀드, 주식 신용거래 등",
      },
    ],
  },
  {
    id: "marriage",
    question: "결혼을 하셨나요?",
    options: [
      { value: "married", label: "기혼" },
      { value: "single", label: "미혼" },
    ],
  },
  {
    id: "child",
    question: "20세 이하의 자녀가 있으신가요?",
    options: [
      { value: "yes", label: "있음" },
      { value: "no", label: "없음" },
    ],
  },
  {
    id: "apt",
    question: "아파트를 소유하고 계신가요?",
    options: [
      { value: "yes", label: "있음" },
      { value: "no", label: "없음" },
    ],
  },
  {
    id: "retire_expect",
    question: "예상 은퇴 시점이 언제인가요?",
    options: [
      { value: "under1_10", label: "10년 이내" },
      { value: "under1_20", label: "20년 이내" },
      { value: "over1_20", label: "20년 초과" },
    ],
  },
];
