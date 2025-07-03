import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./PiePortfolioChart.css";

// 펀드명으로 카테고리 분류하는 함수
const categorizeAsset = (assetName) => {
  const name = assetName.toLowerCase();

  // 보험 키워드 (가장 먼저 체크)
  if (name.includes("예금_db손해보험")) {
    return "insurance";
  }
  // 주식형 키워드
  else if (
    name.includes("주식") ||
    name.includes("stock") ||
    name.includes("equity") ||
    name.includes("kodex") ||
    name.includes("tiger") ||
    name.includes("ai") ||
    name.includes("소프트웨어") ||
    name.includes("방산") ||
    name.includes("중공업") ||
    name.includes("은행") ||
    name.includes("글로벌")
  ) {
    return "stocks";
  }
  // 채권형 키워드 (주식형이 아닌 경우에만 체크)
  else if (
    name.includes("채권") ||
    name.includes("bond") ||
    name.includes("국고") ||
    name.includes("회사채") ||
    name.includes("통안채")
  ) {
    return "bonds";
  }
  // 대체투자 키워드 (주식형도 채권형도 아닌 경우에만 체크)
  else if (
    name.includes("리츠") ||
    name.includes("reit") ||
    name.includes("인프라") ||
    name.includes("원유") ||
    name.includes("금") ||
    name.includes("원자재")
  ) {
    return "alternatives";
  }
  // 어떤 키워드에도 해당하지 않으면 기본값으로 주식형
  else {
    return "stocks";
  }
};

// 백엔드 데이터를 카테고리별로 그룹핑하는 함수
const processPortfolioData = (portfolioProducts) => {
  const categories = {
    stocks: { name: "주식혼합형", percent: 0, color: "#3B82F6", products: [] },
    bonds: { name: "채권혼합형", percent: 0, color: "#10B981", products: [] },
    alternatives: {
      name: "대체투자",
      percent: 0,
      color: "#F59E0B",
      products: [],
    },
    insurance: { name: "보험", percent: 0, color: "#8B5CF6", products: [] }, // 보험 카테고리 추가
  };

  // 각 상품을 카테고리별로 분류
  portfolioProducts.forEach((product) => {
    const category = categorizeAsset(product.asset);
    const cleanName = product.asset.replace("펀드_", ""); // '펀드_' 제거
    const weight = (product.weight * 100).toFixed(1);

    categories[category].percent += parseFloat(weight);
    categories[category].products.push(`${cleanName} (${weight}%)`);
  });

  // 퍼센트 반올림
  Object.keys(categories).forEach((key) => {
    categories[key].percent = parseFloat(categories[key].percent.toFixed(1));
  });

  // 0%인 카테고리는 제외하고 반환
  return Object.values(categories).filter((category) => category.percent > 0);
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const asset = payload[0].payload;
    return (
      <div className="pie-tooltip">
        <b>{asset.name}</b>
        <ul>
          {asset.products.map((prod, idx) => (
            <li key={idx}>{prod}</li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

const PiePortfolioChart = ({ portfolio }) => {
  // 백엔드 데이터가 없으면 기본값 사용
  if (!portfolio || !portfolio.products) {
    return <div>포트폴리오 데이터를 불러오는 중...</div>;
  }

  // 백엔드 데이터를 카테고리별로 처리
  const data = processPortfolioData(portfolio.products);

  return (
    <div className="pie-portfolio-wrap">
      {/* 왼쪽: 추천 상품 상세 리스트 */}
      <div className="pie-rec-list">
        <h3>추천 상품 리스트</h3>
        {data.map((asset, index) => (
          <div className="pie-rec-item" key={asset.name}>
            <div className="pie-rec-header">
              <span
                className="pie-dot"
                style={{ background: asset.color }}
              ></span>
              <span className="pie-rec-name">{asset.name}</span>
              <span className="pie-rec-percent" style={{ color: asset.color }}>
                {asset.percent}%
              </span>
            </div>
            <ul className="pie-products">
              {asset.products.map((prod, i) => (
                <li key={i}>{prod}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 오른쪽: 파이 차트 */}
      <div className="pie-chart-area">
        <h3 className="pie-title">상품군 구성</h3>
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie
              data={data}
              dataKey="percent"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              label={({ name, percent }) => `${name} (${percent}%)`}
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PiePortfolioChart;
