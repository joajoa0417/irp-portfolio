// 점수표 정의 (ageScore = 1, 1.3, 1.6, 2 일 때 각각)
// 표 예시: [age1, age1.3, age1.6, age2] 순서
const jobScoreTable = {
  self_employed: [0, 0, 0, 0],
  freelancer: [0, 0, 0, 0],
  employee: [1, 1, 0.5, 1],
  professional: [1, 1, 0.5, 1],
  retired: [1, 1, 0.5, 1],
};
const incomeScoreTable = {
  under_30m: [0, 0, 0, 0],
  "30m_50m": [0.25, 0.25, 0.25, 0.25],
  "50m_70m": [0.5, 0.5, 0.5, 0.5],
  "70m_100m": [0.75, 0.75, 0.75, 0.75],
  over_100m: [1, 1, 1, 1],
};
const marriageScoreTable = {
  single: [0, 0, 0, 0],
  married: [1, 0.5, 0.5, 0.3],
};
const childScoreTable = {
  no: [0, 0, 0, 0],
  yes: [0.5, 1, 1, 0.3],
};
const aptScoreTable = {
  no: [0, 0, 0, 0],
  yes: [0.5, 1, 0.4, 0.3],
};
const retireScoreTable = {
  under_10: [0.5, 0.2, 1, 1],
  under_20: [0.25, 0.1, 0.5, 0.5],
  over_20: [0, 0, 0, 0],
};

function getAgeScore(age) {
  age = Number(age);
  if (age >= 20 && age <= 34) return { score: 1, idx: 0 };
  if (age >= 35 && age <= 39) return { score: 1.3, idx: 1 };
  if (age >= 40 && age <= 49) return { score: 1.6, idx: 2 };
  if (age >= 50) return { score: 2, idx: 3 };
  return { score: 0, idx: 0 };
}

function getExpectedReturnScore(val) {
  if (val === "plus_minus_5") return 1.5;
  if (val === "plus_minus_10") return 1.125;
  if (val === "plus_minus_20") return 0.75;
  if (val === "over_20") return 0.375;
  return 0;
}
function getInvestTypeScore(val) {
  if (val === "conservative") return 1.5;
  if (val === "conservative_seek") return 1.125;
  if (val === "neutral") return 0.75;
  if (val === "aggressive") return 0.375;
  if (val === "offensive") return 0;
  return 0;
}
function getLossResponseScore(val) {
  if (val === "cut_loss") return 0.5;
  if (val === "wait") return 0.25;
  if (val === "buy_more") return 0;
  return 0;
}
function getStockFundRatioScore(val) {
  if (val === "under_20") return 0.2;
  if (val === "20_40") return 0.13;
  if (val === "40_60") return 0.07;
  if (val === "over_60") return 0;
  return 0;
}
function getProductExperienceScore(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;

  let sum = 0;
  let count = 0;

  values.forEach((val) => {
    if (val === "deposit_savings") {
      sum += 0.3;
      count += 1;
    }
    if (val === "high_grade_bond_els") {
      sum += 0.225;
      count += 1;
    }
    if (val === "mid_grade_bond_els") {
      sum += 0.15;
      count += 1;
    }
    if (val === "low_grade_stock") {
      sum += 0.075;
      count += 1;
    }
    // derivatives는 0점 (count도 증가하지 않음)
  });

  return count > 0 ? sum / count : 0;
}

// ⭐️ 메인 계산 함수
export function getTotalSurveyScore(answers) {
  const {
    age: ageInput,
    job,
    income,
    marriage,
    child,
    apt,
    retire_expect,
  } = answers;
  const { score: ageScore, idx } = getAgeScore(ageInput);

  let total = 0;
  total += ageScore;
  total += jobScoreTable[job]?.[idx] || 0;
  total += incomeScoreTable[income]?.[idx] || 0;
  total += getExpectedReturnScore(answers.expected_return);
  total += getInvestTypeScore(answers.invest_type);
  total += getLossResponseScore(answers.loss_response);
  total += getStockFundRatioScore(answers.stock_fund_ratio);
  total += getProductExperienceScore(answers.product_experience);
  total += marriageScoreTable[marriage]?.[idx] || 0;
  total += childScoreTable[child]?.[idx] || 0;
  total += aptScoreTable[apt]?.[idx] || 0;
  total += retireScoreTable[retire_expect]?.[idx] || 0;
  return total;
}
