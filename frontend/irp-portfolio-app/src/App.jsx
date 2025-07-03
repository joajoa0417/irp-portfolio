import React, { useState, useEffect } from "react";

import {
  ChevronRight,
  CheckCircle,
  TrendingUp,
  Target,
  Home,
  Calculator,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  Shield,
  ClipboardList,
  Users,
  Award,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import "./App.css";
import PiePortfolioChart from "./components/PiePortfolioChart";
import "./components/PiePortfolioChart.css";
import kakaoImage from "./image/fotor-20250630174538.png";
import logo2 from "./image/logo2.png";
import logoIcon from "./image/location-fotor-2025070110251.png";
import Information from "./components/information";
import "./components/information.css";
import { advancedSurveyQuestions } from "./components/secondlist";
import { getTotalSurveyScore } from "./components/Score";

// --- input 수정 부분
const DelayedTextInput = React.memo(
  ({ questionId, placeholder, value, onChange }) => {
    const [localValue, setLocalValue] = useState(value || "");

    const handleSubmitValue = () => {
      if (localValue !== value) {
        onChange(questionId, localValue);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.target.blur(); // 포커스 제거하여 onBlur 트리거
      }
    };

    return (
      <input
        type="number"
        placeholder={placeholder || ""}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)} // 로컬 상태만 업데이트
        onBlur={handleSubmitValue} // 포커스 잃을 때 실제 값 업데이트
        onKeyDown={handleKeyDown} // Enter 키 처리
        className="option-card"
        min="1"
        max="120"
        style={{ width: "100%" }}
      />
    );
  }
);

// 차트 데이터 생성 함수
const generateChartDataFromPortfolio = (products) => {
  const colors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28DFC",
    "#FF6E6E",
  ];

  return products.map((p, idx) => ({
    name: p.asset,
    value: parseFloat((p.weight * 100).toFixed(1)), // 37.2처럼 보여주기
    color: colors[idx % colors.length],
  }));
};

// 점수 레벨 함수
const getScoreLevel = (score) => {
  if (score >= 6)
    return {
      level: "👑 연금왕",
      color: "purple",
      bg: "purple-bg",
      image: "1.png",
    };
  if (score >= 4)
    return {
      level: "💸 프로 연금러",
      color: "green",
      bg: "green-bg",
      image: "2.png",
    };
  if (score >= 2)
    return {
      level: "🧑‍💼 퇴직 준비생",
      color: "blue",
      bg: "blue-bg",
      image: "3.png",
    };
  return { level: "🐣 투린이", color: "amber", bg: "amber-bg", image: "4.png" };
};

const ProfessionalIRPSite = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedAgeIndex, setExpandedAgeIndex] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // ProfessionalIRPSite 컴포넌트 내부에 추가
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep, currentPage]); // currentStep이나 currentPage가 변경될 때마다 실행

  const generateAdvancedPortfolio = async () => {
    if (isGenerating) return;
    setIsGenerating(true); // 시작 플래그 설정

    try {
      // 🔥 친구 코드의 연령 매핑 방식 사용
      const getAgeGroup = (age) => {
        const numAge = Number(age);
        if (numAge >= 20 && numAge <= 34) return "20대(20~34세)";
        if (numAge >= 35 && numAge <= 39) return "30대(35~39세)";
        if (numAge >= 40 && numAge <= 49) return "40대(40~49세)";
        if (numAge >= 50 && numAge <= 59) return "50대(50~59세)";
        return "60대 이상";
      };
      const getInvestorType = (calculatedA) => {
        if (calculatedA >= 8) return "🛡️ 안정형";
        if (calculatedA >= 6) return "🌱 안정추구형";
        if (calculatedA >= 4) return "⚖️ 신중한 중립형";
        if (calculatedA >= 2) return "🚀 적극투자형";
        return "💪 공격형";
      };

      // 🔥 친구 코드의 필드 매핑 방식 사용
      const fieldMap = {
        job: "직업",
        income: "소득",
        marriage: "결혼여부",
        child: "미성년자녀 유무",
        apt: "아파트 보유여부",
        retire_expect: "은퇴시점",
        expected_return: "기대수익률",
        invest_type: "투자성향설문",
        loss_response: "20%손실감내",
        stock_fund_ratio: "주식펀드비중",
        product_experience: "투자상품경험",
      };

      // 🔥 친구 코드의 값 매핑 사용 (중요한 차이점들!)
      const valueMap = {
        single: "미혼",
        married: "기혼",
        no: "없음",
        yes: "있음",

        plus_minus_5: "원금기준 ± 5%",
        plus_minus_10: "원금기준 ± 10%",
        plus_minus_20: "원금기준 ± 20%",
        over_20: "원금기준 ± 20% 초과", // ⚠️ "20% 초과도 가능" -> "원금기준 ± 20% 초과"

        conservative: "안정형", // ⚠️ "안정추구형" -> "안정형"
        conservative_seek: "안정추구형",
        neutral: "중립투자형",
        aggressive: "적극투자형",
        offensive: "공격투자형",

        cut_loss: "바로 손절한다", // ⚠️ "손절매한다" -> "바로 손절한다"
        wait: "고민해보겠지만 어느 정도 기다린다",
        buy_more: "추가 매수하고 장기 보유한다", // ⚠️ "추가매수 기회로 본다" -> "추가 매수하고 장기 보유한다"

        under_20: "20% 미만",
        "20_40": "20% 이상 - 40% 미만", // ⚠️ "20_to_40" -> "20_40", "20% 이상 ~ 40% 미만" -> "20% 이상 - 40% 미만"
        "40_60": "40% 이상 ~ 60% 미만",
        over_60: "60% 초과", // ⚠️ "60% 이상" -> "60% 초과"

        deposit_savings: "안정형 상품", // ⚠️ "예적금" -> "안정형 상품"
        high_grade_bond_els: "안정추구형 상품", // ⚠️ "고등급 회사채 및 ELS" -> "안정추구형 상품"
        mid_grade_bond_els: "중립투자형 상품",
        low_grade_stock: "적극투자형 상품",
        derivatives: "공격투자형 상품", // ⚠️ "파생상품" -> "공격투자형 상품"

        over1_20: "20년 초과", // ⚠️ "over_20" -> "over1_20"
        under1_20: "20년 이내",
        under1_10: "10년 이내", // ⚠️ "under_10" -> "under1_10", "10년 미만" -> "10년 이내"

        under_30m: "3천만원 미만",
        "30m_50m": "3000만원 이상 ~ 5000만원 미만", // ⚠️ "30m_to_50m" -> "30m_50m"
        "50m_70m": "5000만원 이상 ~ 7000만원 미만", // ⚠️ "50m_to_70m" -> "50m_70m"
        "70m_100m": "7000만원 이상 ~ 1억원 미만", // ⚠️ "70m_to_100m" -> "70m_100m"
        over_100m: "1억원 이상",

        employee: "직장인",
        professional: "전문직",
        self_employed: "자영업자",
        freelancer: "프리랜서",
        retired: "퇴직자",
      };

      // 🔥 친구 코드의 변환 방식 사용
      const convertedAnswers = {};

      for (const key in fieldMap) {
        if (Object.prototype.hasOwnProperty.call(surveyAnswers, key)) {
          const koreanKey = fieldMap[key];
          let value = surveyAnswers[key];

          if (Array.isArray(value)) {
            value = value.map((v) => valueMap[v] || v).join(", ");
          } else {
            value = valueMap[value] || value;
          }

          convertedAnswers[koreanKey] = value;
        }
      }

      const requestBody = {
        age_group: getAgeGroup(surveyAnswers.age),
        answers: convertedAnswers,
      };

      console.log(
        "✅ 요청 바디 @",
        Date.now(),
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch("http://3.38.123.45:8000/recommend", {
        // ⚠️ 127.0.0.1 -> localhost
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ 서버 응답 오류:", text);
        throw new Error("포트폴리오 API 호출 실패");
      }

      const result = await response.json();
      console.log("✅ 백엔드 응답 @", Date.now(), result);

      // 💡 백엔드 실제 데이터로 포트폴리오 설정 (친구 방식 + 당신 UI 유지)
      setPortfolio({
        calculatedA: result.calculated_A,
        investorScore: result.investor_score,
        maxRisky: result.max_risky,
        alpha: result.alpha,
        products: result.portfolio,
        warnings: result.warnings || [],

        type: getInvestorType(result.calculated_A),
        expectedReturn: result.calculated_A > 0 ? result.calculated_A : 7.5,
        maxDrawdown: -15.5,
        sharpeRatio: 0.68,
        beta: 0.95,
        fees: {
          management: 0.35,
          performance: 0,
          transaction: 0.015,
        },
        allocation: {
          domestic_equity: 40,
          global_equity: 30,
          domestic_bond: 20,
          global_bond: 5,
          alternatives: 5,
          safe: 0,
        },
      });

      setChartData(generateChartDataFromPortfolio(result.portfolio));
      setCurrentStep(5);
    } catch (error) {
      console.error("포트폴리오 생성 실패:", error);
      alert("포트폴리오 생성 실패: " + error.message);
    } finally {
      setIsGenerating(false); // 무조건 리셋
    }
  };

  // 시뮬레이션 데이터
  const projectionData = [
    { age: 30, conservative: 15000, balanced: 18000, aggressive: 22000 },
    { age: 35, conservative: 32000, balanced: 42000, aggressive: 58000 },
    { age: 40, conservative: 52000, balanced: 75000, aggressive: 110000 },
    { age: 45, conservative: 75000, balanced: 118000, aggressive: 185000 },
    { age: 50, conservative: 102000, balanced: 175000, aggressive: 295000 },
    { age: 55, conservative: 135000, balanced: 248000, aggressive: 450000 },
    { age: 60, conservative: 175000, balanced: 340000, aggressive: 685000 },
  ];

  const riskReturnData = [
    { risk: 5, return: 3.2, type: "안정형", color: "#6B7280" },
    { risk: 12, return: 5.8, type: "균형성장형", color: "#10B981" },
    { risk: 18, return: 8.5, type: "공격적성장형", color: "#EF4444" },
    { risk: 25, return: 11.2, type: "고위험고수익형", color: "#8B5CF6" },
  ];

  const marketData = [
    { name: "국내주식", value: 35, performance: "+12.5%", color: "#1E40AF" },
    { name: "해외주식", value: 30, performance: "+8.7%", color: "#3B82F6" },
    { name: "국내채권", value: 20, performance: "+3.2%", color: "#10B981" },
    { name: "해외채권", value: 10, performance: "+2.8%", color: "#059669" },
    { name: "REITs", value: 5, performance: "+6.4%", color: "#F59E0B" },
  ];

  const irpQuizQuestions = [
    {
      id: "irp_basic",
      question: "IRP의 정식 명칭은 무엇인가요?",
      options: [
        {
          value: "individual_retirement_pension",
          label: "Individual Retirement Pension",
          correct: true,
        },
        {
          value: "individual_retirement_plan",
          label: "Individual Retirement Plan",
          correct: false,
        },
        {
          value: "independent_retirement_pension",
          label: "Independent Retirement Pension",
          correct: false,
        },
        {
          value: "institutional_retirement_plan",
          label: "Institutional Retirement Plan",
          correct: false,
        },
      ],
    },
    {
      id: "irp_tax",
      question: "IRP 세액공제 한도는 연간 얼마인가요?",
      options: [
        { value: "600", label: "600만원", correct: false },
        { value: "700", label: "700만원", correct: false },
        { value: "800", label: "800만원", correct: false },
        { value: "900", label: "900만원", correct: true },
      ],
    },
    {
      id: "irp_withdraw",
      question: "IRP 연금 수령 가능 나이는?",
      options: [
        { value: "55", label: "만 55세", correct: true },
        { value: "60", label: "만 60세", correct: false },
        { value: "65", label: "만 65세", correct: false },
        { value: "70", label: "만 70세", correct: false },
      ],
    },
    {
      id: "irp_risk_limit",
      question: "IRP 계좌에서 전체 자산 중 위험자산의 최대 비중은?",
      options: [
        { value: "50", label: "50%", correct: false },
        { value: "60", label: "60%", correct: false },
        { value: "70", label: "70%", correct: true },
        { value: "100", label: "100%", correct: false },
      ],
    },
    // 추가 5번
    {
      id: "irp_taxation_withdraw",
      question: "IRP 계좌에서 중도 출금(해지) 시 적용되는 세금은?",
      options: [
        {
          value: "other_income_16_5",
          label: "기타소득세 16.5%",
          correct: true,
        },
        { value: "income_3_3_5_5", label: "소득세 3.3~5.5%", correct: false },
        { value: "dividend_15_4", label: "배당소득세 15.4%", correct: false },
        { value: "none", label: "세금 없음", correct: false },
      ],
    },
    // 추가 6번
    {
      id: "irp_cannot_deposit",
      question: "IRP 계좌에 입금할 수 없는 자금은?",
      options: [
        { value: "retirement_pay", label: "퇴직급여", correct: false },
        {
          value: "personal_payment",
          label: "개인 자율적 추가 납입",
          correct: false,
        },
        { value: "inherited_saving", label: "상속받은 예금", correct: true },
        {
          value: "transfer_from_pension",
          label: "연금저축 이전금액",
          correct: false,
        },
      ],
    },
    // 추가 7번
    {
      id: "irp_min_period",
      question: "IRP에서 연금 수령 시, 수령 기간은 최소 몇 년 이상인가요?",
      options: [
        { value: "1", label: "1년", correct: false },
        { value: "5", label: "5년", correct: true },
        { value: "10", label: "10년", correct: false },
        { value: "20", label: "20년", correct: false },
      ],
    },
  ];

  const checkQuizAnswers = () => {
    const correctAnswers = irpQuizQuestions.filter((question) => {
      const userAnswer = quizAnswers[question.id];
      const correctOption = question.options.find((opt) => opt.correct);
      return userAnswer === correctOption.value;
    });

    setQuizScore(correctAnswers.length);
    setCurrentStep(3);
    window.scrollTo(0, 0);
  };

  const Header = () => (
    <header className="professional-header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-section" onClick={() => setCurrentPage("home")}>
            <div className="logo-icon">
              <img src={logo2} alt="IRP Logo" className="logo-symbol2" />
              {/* <img src={logoIcon} alt="IRP Logo" className="logo-symbol" /> */}
            </div>
            <div className="logo-text">
              <span className="company-name">
                <span className="kiwoom">Kiwoom</span>
                <span className="road">Road</span>
              </span>
              <div className="company-subtitle">
                당신의 미래, 키움로드와 함께 걷다
              </div>
            </div>
          </div>
          <nav className="main-nav">
            <button onClick={() => setCurrentPage("home")} className="nav-item">
              <Home size={16} />
              <span>홈</span>
            </button>
            <button
              onClick={() => setCurrentPage("guide")}
              className="nav-item"
            >
              <ClipboardList size={16} />
              <span>키움로드 안내</span>
            </button>

            <button
              onClick={() => {
                setCurrentPage("service");
                setCurrentStep(1);
              }}
              className="nav-item"
            >
              <Calculator size={16} />
              <span>포트폴리오 진단</span>
            </button>
            <button
              className="cta-nav-button"
              onClick={() =>
                window.open("https://www.kiwoom.com/h/main", "_blank")
              }
            >
              전문상담 신청
            </button>
          </nav>
        </div>
      </div>
    </header>
  );

  const HomePage = () => (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-flex-wrap">
          {/* 왼쪽: 텍스트/버튼 */}
          <div className="hero-content">
            <h1 className="hero-title">
              1분 만에 투자 성향 체크하고
              <br />
              <span className="title-highlight">
                나에게 딱 맞는 IRP 포트폴리오 추천받아요
              </span>
            </h1>
            <p className="hero-subtitle">
              데이터 기반 맞춤 추천으로 내 퇴직연금, 똑똑하게 키워요.
            </p>
            <div className="hero-actions">
              <button
                onClick={() => setCurrentPage("guide")}
                className="secondary-action-btn"
              >
                자세히 보기
              </button>
              <button
                onClick={() => {
                  setCurrentPage("service");
                  setCurrentStep(1);
                }}
                className="primary-action-btn"
              >
                <BarChart3 size={24} />
                <span>무료 포트폴리오 진단</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          {/* 오른쪽: 이미지 */}
          <div className="hero-image-box">
            <img
              src={kakaoImage}
              alt="카카오톡 이미지"
              style={{ marginRight: "-50px" }}
            />
          </div>
        </div>
      </section>

      {/* Performance Dashboard */}

      <section className="dashboard-section">
        <div className="section-container">
          <div className="section-header">
            <h2>실시간 운용 현황</h2>
            <p>데이터 기반 투명한 운용 성과를 확인하세요</p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card blue">
              <div className="card-header">
                <Users className="card-icon" size={24} />
                <span className="trend-indicator positive">↗ +15.3%</span>
              </div>
              <div className="card-value">28,547</div>
              <div className="card-label">활성 계좌 수</div>
            </div>

            <div className="dashboard-card green">
              <div className="card-header">
                <Shield className="card-icon" size={24} />
                <span className="trend-indicator positive">↗ +8.7%</span>
              </div>
              <div className="card-value">4,521억원</div>
              <div className="card-label">운용자산 규모 (AUM)</div>
            </div>

            <div className="dashboard-card amber">
              <div className="card-header">
                <TrendingUp className="card-icon" size={24} />
                <span className="trend-indicator positive">↗ +2.1%</span>
              </div>
              <div className="card-value">8.7%</div>
              <div className="card-label">연평균 수익률 (3년)</div>
            </div>

            <div className="dashboard-card purple">
              <div className="card-header">
                <Target className="card-icon" size={24} />
                <span className="trend-indicator positive">↗ +0.05</span>
              </div>
              <div className="card-value">0.68</div>
              <div className="card-label">샤프 비율</div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>포트폴리오 성과 시뮬레이션</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="age" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()}만원`, ""]}
                    labelFormatter={(label) => `${label}세`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conservative"
                    stroke="#6B7280"
                    strokeWidth={3}
                    name="안정형"
                  />
                  <Line
                    type="monotone"
                    dataKey="balanced"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="균형형"
                  />
                  <Line
                    type="monotone"
                    dataKey="aggressive"
                    stroke="#EF4444"
                    strokeWidth={3}
                    name="공격형"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>리스크-수익률 매트릭스</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={riskReturnData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="risk"
                    stroke="#64748b"
                    label={{
                      value: "리스크 (%)",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    dataKey="return"
                    stroke="#64748b"
                    label={{
                      value: "수익률 (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "return" ? `${value}%` : `${value}%`,
                      name === "return" ? "예상수익률" : "리스크",
                    ]}
                  />
                  {riskReturnData.map((entry, index) => (
                    <circle
                      key={index}
                      cx={entry.risk * 20}
                      cy={300 - entry.return * 20}
                      r={8}
                      fill={entry.color}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Features */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>전문가급 포트폴리오 관리</h2>
            <p>기관투자자 수준의 정교한 리스크 관리 시스템</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue-gradient">
                <BarChart3 size={32} />
              </div>
              <h3>정량적 리스크 분석</h3>
              <ul className="feature-list">
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>VaR (Value at Risk) 99% 신뢰구간</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>최대낙폭(MDD) 실시간 모니터링</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>변동성 조정 수익률(RAR) 최적화</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>베타, 알파, 정보비율 분석</span>
                </li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon green-gradient">
                <Shield size={32} />
              </div>
              <h3>동적 리밸런싱</h3>
              <ul className="feature-list">
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>월간 자동 리밸런싱 실행</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>시장 변동성 기반 조정</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>세금 효율적 매매 최적화</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>거래비용 최소화 알고리즘</span>
                </li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon amber-gradient">
                <Award size={32} />
              </div>
              <h3>ESG 통합 운용</h3>
              <ul className="feature-list">
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>ESG 등급 A 이상 종목 선별</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>지속가능 투자 전략 적용</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>스튜어드십 코드 준수</span>
                </li>
                <li className="feature-item">
                  <CheckCircle size={16} />
                  <span>기후변화 리스크 반영</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Market Analysis */}
      <section className="market-section">
        <div className="section-container">
          <div className="section-header">
            <h2>시장 분석 및 전망</h2>
            <p>실시간 글로벌 자산 시장 동향 분석</p>
          </div>

          <div className="market-grid">
            <div className="market-card">
              <h3>자산군별 성과 현황</h3>
              <div className="asset-list">
                {marketData.map((asset, index) => (
                  <div key={index} className="asset-item">
                    <div className="asset-info">
                      <div
                        className="asset-color"
                        style={{ backgroundColor: asset.color }}
                      ></div>
                      <span className="asset-name">
                        {asset.name} {asset.value}%
                      </span>
                    </div>
                    <div className="asset-metrics">
                      <span
                        className={`asset-performance ${
                          asset.performance.startsWith("+")
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {asset.performance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="market-card">
              <h3>경제 지표 모니터링</h3>
              <div className="indicator-list">
                <div className="indicator-item">
                  <div className="indicator-row">
                    <span className="indicator-name">한국 기준금리</span>
                    <span className="market-value">2.50%</span>
                  </div>
                  <div className="indicator-trend neutral">→ 동결 전망</div>
                </div>
                <div className="indicator-item">
                  <div className="indicator-row">
                    <span className="indicator-name">미국 연방금리</span>
                    <span className="market-value">4.50%</span>
                  </div>
                  <div className="indicator-trend down">
                    ↓ 금리 인하 기대감 반영
                  </div>
                </div>
                <div className="indicator-item">
                  <div className="indicator-row">
                    <span className="indicator-name">KOSPI 변동성(VIX)</span>
                    <span className="market-value">18.4</span>
                  </div>
                  <div className="indicator-trend neutral">→ 보통 수준</div>
                </div>
                <div className="indicator-item">
                  <div className="indicator-row">
                    <span className="indicator-name">원/달러 환율</span>
                    <span className="market-value">1,349원</span>
                  </div>
                  <div className="indicator-trend up">↑ 강달러 지속</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background"></div>
        <div className="cta-content">
          <h2>지금 시작하세요</h2>
          <p>
            정량적 분석 기반 맞춤형 IRP 포트폴리오로
            <br />
            <strong className="cta-highlight">안정적인 퇴직연금 수익률</strong>
            을 확보하세요
          </p>
          <div className="cta-actions">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" }); // 부드럽게 맨 위로 스크롤
              }}
              className="cta-primary-btn"
            >
              퇴직연금 확보하기💰
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const IntroStep = () => (
    <div className="step-page">
      <div className="step-container">
        <div className="intro-hero">
          <h1>IRP 포트폴리오 전문 진단</h1>
          <p>정량적 리스크 분석을 통한 최적 자산배분 설계</p>
        </div>

        <div className="content-card">
          <h2>IRP(개인형 퇴직연금) 가이드</h2>

          <div className="guide-grid">
            <div className="guide-section">
              <div className="guide-item">
                <h3 className="guide-title blue">
                  <CheckCircle size={20} />
                  IRP 제도 개요
                </h3>
                <div className="info-box blue">
                  <p>
                    <strong>
                      개인형 퇴직연금(IRP, Individual Retirement Pension)
                    </strong>
                    <br />
                    내가 직접 퇴직 이후를 준비하는 개인 명의의 퇴직연금
                    계좌입니다.
                  </p>
                  <ul className="info-list">
                    <li>• 가입대상: 근로자, 자영업자, 공무원 등</li>
                    <li>• 수령시기: 만 55세부터 수령 가능</li>
                    <li>• 세액공제: 연간 최대 900만원까지 절세 가능</li>
                    <li>• 과세: 연금소득세 적용 (3.3~5.5%)</li>
                  </ul>
                </div>
              </div>

              <div className="guide-item">
                <div style={{ height: "18px" }} />
                <h3 className="guide-title green">
                  <ClipboardList size={20} />
                  IRP 제도 특징
                </h3>
                <div className="info-box green">
                  <p>
                    IRP는 <strong>은퇴 준비를 위한 장기 계좌</strong>인 만큼,
                    다양한 제약과 혜택이 공존합니다.
                  </p>
                  <ul className="info-list">
                    <li>
                      • 세제 혜택: 매년 납입액에 대해 소득 구간별 세액공제
                    </li>
                    <li>
                      • 중도 해지 시 불이익: 목적 외 출금 시 16.5% 기타소득세
                      부과
                    </li>
                    <li>
                      • 자산 운용 제한: 위험자산 비중은 최대 70%까지만 허용
                    </li>
                    <li>
                      • 연금 수령 조건: 최소 5년 이상 분할 수령해야 세제 혜택
                      유지
                    </li>
                    <li>
                      • 타 계좌 이체 제한: 상속받은 예금은 IRP 계좌에 입금 불가
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="guide-section">
              <div className="guide-item">
                <h3 className="guide-title purple">
                  <BarChart3 size={20} />
                  투자 가능 상품
                </h3>
                <div className="products-container">
                  <div className="product-category purple">
                    <p>
                      IRP 계좌 안에서는 다양한 금융 상품에 직접 투자할 수
                      있어요.
                      <br />
                      단, <strong>위험자산 70% 제한</strong>을 고려해야 해요.
                    </p>
                    <br />
                    <h4>원리금보장상품 (안정성 중시)</h4>
                    <ul>
                      <li>• 정기예금, 적금</li>
                      <li>• ELB (주가연계파생결합사채)</li>
                      <li>• 국고채, 회사채</li>
                      <li>• 증권사 RP</li>
                    </ul>
                    <br />
                    <h4>실적배당상품 (고수익 추구)</h4>
                    <ul>
                      <li>
                        • 국내외 주식형 펀드 (KODEX 200, TIGER 미국S&P500)
                      </li>
                      <li>• 섹터별 ETF (IT, 바이오, 금융)</li>
                      <li>• 대안투자 (리츠, 인프라펀드)</li>
                      <li>• ESG 투자상품</li>
                      <li>• 글로벌 혼합자산 펀드</li>
                    </ul>
                    <br />
                    <h4>
                      🎯 수익성과 안정성의 균형을 맞춰 스스로 포트폴리오를
                      구성할 수 있습니다.
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="disclaimer-box">
            <h3 className="disclaimer-title">
              <AlertCircle size={20} />
              중요 사항
            </h3>
            <p>
              본 진단 서비스는 <strong>정보제공 목적의 단순 참고자료</strong>
              입니다. 실제 투자 결정 시에는 개별 상품의 투자설명서를 반드시
              확인하시고, 전문가와 충분한 상담 후 진행하시기 바랍니다. <br />
              과거 수익률이 미래 수익률을 보장하지 않으며, 원금손실 가능성이
              있습니다.
            </p>
          </div>

          <div className="step-actions">
            <button onClick={() => setCurrentStep(2)} className="next-step-btn">
              <Calculator size={24} />
              <span>전문가 수준 IRP 지식 테스트</span>
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const QuizStep = () => {
    const handleQuizAnswer = (questionId, value) => {
      setQuizAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const isComplete =
      Object.keys(quizAnswers).length === irpQuizQuestions.length;

    return (
      <div className="step-page">
        <div className="step-container">
          <div className="content-card">
            <div className="quiz-header">
              <h2>IRP 전문 지식 평가</h2>
              <p>
                퇴직연금 전문 지식을 확인하여 맞춤형 포트폴리오를 제공합니다.
              </p>
              <div className="benefit-notice">
                <div className="benefit-icon">
                  <CheckCircle size={16} />
                  <span>
                    고득점 시 프리미엄 상품 정보 및 수수료 할인 혜택 제공
                  </span>
                </div>
              </div>
            </div>

            <div className="questions-container">
              {irpQuizQuestions.map((question, qIndex) => (
                <div key={question.id} className="question-card">
                  <h3 className="question-title">
                    <div className="question-number">{qIndex + 1}</div>
                    {question.question}
                  </h3>
                  <div className="options-grid">
                    {question.options.map((option) => (
                      <label
                        key={option.value}
                        className={`option-card ${
                          quizAnswers[question.id] === option.value
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={quizAnswers[question.id] === option.value}
                          onChange={(e) =>
                            handleQuizAnswer(question.id, e.target.value)
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="step-navigation">
              <button onClick={() => setCurrentStep(1)} className="prev-btn">
                이전 단계
              </button>
              <button
                onClick={checkQuizAnswers}
                disabled={!isComplete}
                className={`next-btn ${!isComplete ? "disabled" : ""}`}
              >
                평가 결과 확인
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuizResultStep = () => {
    const scoreInfo = getScoreLevel(quizScore);

    return (
      <div className="quiz-result-container">
        <div className="result-card">
          <div className="result-header">
            <button className="share-button">📤 공유하기</button>
          </div>

          {/* 타이틀 */}
          <h2 className="result-title">IRP 전문 지식 평가 결과</h2>

          {/* 이미지 + 뱃지 겹치기 */}
          <div className="badge-over-image">
            <img
              src={`/images/${scoreInfo.image}`}
              alt={scoreInfo.level}
              className="result-image"
            />
            <div className={`score-badge ${scoreInfo.bg}`}>
              <span className={`badge-text ${scoreInfo.color}`}>
                {scoreInfo.level}
              </span>
            </div>
          </div>

          {/* 점수 */}
          <div className="score-display">{quizScore}/7</div>

          <p className="result-message">
            {quizScore >= 6 &&
              "🎉 최고 등급! IRP 전문가 수준의 지식을 보유하고 계십니다!"}
            {quizScore >= 4 &&
              quizScore <= 5 &&
              "👏 우수한 수준! 고급 포트폴리오 전략을 활용할 수 있습니다!"}
            {quizScore >= 2 &&
              quizScore <= 3 &&
              "📚 양호한 수준! 기본적인 IRP 지식을 잘 알고 계시네요!"}
            {quizScore <= 1 &&
              "💪 학습이 필요해요! 전문가 상담을 통해 더 나은 전략을 세워보세요!"}
          </p>

          {/* 해설 */}
          <div className="result-content">
            <div className="explanation-section">
              <h3>정답 해설</h3>
              <div className="explanation-list">
                <div className="explanation-item">
                  <strong>Q1:</strong> IRP는{" "}
                  <strong>Individual Retirement Pension</strong>의 약자입니다.
                </div>
                <div className="explanation-item">
                  <strong>Q2:</strong> 2024년 기준 IRP 세액공제 한도는{" "}
                  <strong>연간 900만원</strong>입니다.
                </div>
                <div className="explanation-item">
                  <strong>Q3:</strong> IRP는{" "}
                  <strong>만 55세부터 연금으로 수령</strong> 가능합니다.
                </div>
                <div className="explanation-item">
                  <strong>Q4:</strong> IRP 계좌에서는 위험자산 비중이{" "}
                  <strong>70%</strong>를 넘지 않도록 제한됩니다.
                </div>
                <div className="explanation-item">
                  <strong>Q5:</strong> IRP 중도 해지 시{" "}
                  <strong>기타소득세 16.5%</strong>가 부과됩니다.
                </div>
                <div className="explanation-item">
                  <strong>Q6:</strong> <strong>상속받은 예금</strong>은 IRP에
                  입금할 수 없습니다.
                </div>
                <div className="explanation-item">
                  <strong>Q7:</strong> IRP 연금 수령 시{" "}
                  <strong>최소 5년 이상</strong> 수령해야 합니다.
                </div>
              </div>
            </div>

            {/* 혜택 */}
            <div className="benefits-section">
              <h3>맞춤 혜택</h3>
              <div className="benefits-list">
                {quizScore >= 3 && (
                  <div className="benefit-item">
                    <CheckCircle size={16} />
                    <span>프리미엄 포트폴리오 전략 제공</span>
                  </div>
                )}
                {quizScore >= 2 && (
                  <div className="benefit-item">
                    <CheckCircle size={16} />
                    <span>상품 수수료 10% 할인</span>
                  </div>
                )}
                <div className="benefit-item">
                  <CheckCircle size={16} />
                  <span>전문가 1:1 컨설팅 무료 제공</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle size={16} />
                  <span>월간 포트폴리오 리포트 발송</span>
                </div>
              </div>
            </div>
          </div>

          {/* 다음 버튼 */}
          <button className="next-step-btn" onClick={() => setCurrentStep(4)}>
            <Target size={24} />
            <span>정밀 투자성향 분석 시작</span>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const SurveyStep = ({
    answers = {},
    onChange = () => {},
    onSubmit = () => {},
    onPrev,
  }) => {
    const handleSurveyAnswer = (questionId, value) => {
      onChange((prev) => ({ ...prev, [questionId]: value }));
    };

    const isComplete = advancedSurveyQuestions.every((q) => {
      const ans = answers[q.id];
      if (q.type === "checkbox") return Array.isArray(ans) && ans.length > 0;
      return ans !== undefined && ans !== "";
    });

    return (
      <div className="step-page">
        <div className="step-container">
          <div className="content-card">
            <div className="survey-header">
              <h2>정밀 투자성향 분석</h2>
              <p>
                귀하의 투자 프로필을 정밀 분석하여 최적의 리스크-수익률
                포트폴리오를 설계합니다.
              </p>
              <div className="analysis-notice">
                <div className="analysis-icon">
                  <BarChart3 size={16} />
                  <span>정량적 분석 기반 포트폴리오 최적화</span>
                </div>
                <div className="analysis-features">
                  • 샤프 비율 최대화 • VaR 기반 리스크 관리 • 동적 리밸런싱 적용
                </div>
              </div>
            </div>

            <div className="questions-container">
              {advancedSurveyQuestions.map((question, qIndex) => (
                <div key={question.id} className="question-card">
                  <h3 className="question-title">
                    <div className="question-number">{qIndex + 1}</div>
                    {question.question}
                  </h3>

                  {/* ✨ 질문 타입별 렌더링 */}
                  {question.type === "text" && (
                    <DelayedTextInput
                      questionId={question.id}
                      placeholder={question.placeholder}
                      value={surveyAnswers[question.id]}
                      onChange={handleSurveyAnswer}
                    />
                  )}

                  {question.type === "checkbox" && (
                    <div className="options-list">
                      {question.options.map((option) => (
                        <label key={option.value} className="option-card">
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={
                              Array.isArray(answers[question.id]) &&
                              answers[question.id].includes(option.value)
                            }
                            onChange={(e) => {
                              const prev = answers[question.id] || [];
                              const next = e.target.checked
                                ? [...prev, option.value]
                                : prev.filter((v) => v !== option.value);
                              handleSurveyAnswer(question.id, next);
                            }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {!question.type && (
                    <div className="options-list">
                      {question.options.map((option) => (
                        <label
                          key={option.value}
                          className={`option-card ${
                            answers[question.id] === option.value
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option.value}
                            checked={answers[question.id] === option.value}
                            onChange={() =>
                              handleSurveyAnswer(question.id, option.value)
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="step-navigation">
              <button onClick={onPrev} className="prev-btn">
                이전 단계
              </button>
              <button
                onClick={onSubmit}
                disabled={!isComplete}
                className={`next-btn ${!isComplete ? "disabled" : ""}`}
              >
                최적 포트폴리오 생성
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PortfolioStep = ({ portfolio, chartData }) => {
    if (!portfolio || !chartData) return <div>Loading...</div>;

    // 여기에 performanceData와 riskMetrics를 넣으세요
    const performanceData = [
      {
        name: "1년",
        portfolio: portfolio.expectedReturn * 0.8,
        benchmark: 5.2,
        market: 4.8,
      },
      {
        name: "3년",
        portfolio: portfolio.expectedReturn * 0.9,
        benchmark: 5.5,
        market: 5.1,
      },
      {
        name: "5년",
        portfolio: portfolio.expectedReturn,
        benchmark: 6.0,
        market: 5.8,
      },
      {
        name: "10년",
        portfolio: portfolio.expectedReturn * 1.1,
        benchmark: 6.2,
        market: 6.0,
      },
    ];

    const riskMetrics = [
      {
        name: "샤프비율",
        value: portfolio.sharpeRatio,
        benchmark: 0.45,
        unit: "",
      },
      {
        name: "변동성",
        value: Math.abs(portfolio.maxDrawdown) * 0.8,
        benchmark: 15.2,
        unit: "%",
      },
      {
        name: "최대낙폭",
        value: Math.abs(portfolio.maxDrawdown),
        benchmark: 22.5,
        unit: "%",
      },
      { name: "베타", value: portfolio.beta, benchmark: 1.0, unit: "" },
    ];

    return (
      <div className="step-page">
        <div className="portfolio-container">
          <div className="portfolio-card">
            {/* Header */}
            <div className="portfolio-header">
              <h2>KiwoomRoad가 제안하는 최적화된 IRP 포트폴리오</h2>
              <p>정량적 리스크 분석을 통한 맞춤형 자산배분 전략 추천</p>
              <br />
              <div className="portfolio-type-badge">
                <span>{portfolio.type}</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
              <div className="tab-container">
                {["overview", "allocation", "performance", "rebalancing"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`tab-button ${
                        activeTab === tab ? "active" : ""
                      }`}
                    >
                      {tab === "overview" && "포트폴리오 개요"}
                      {tab === "allocation" && "추천상품"}
                      {tab === "performance" && "성과분석"}
                      {tab === "rebalancing" && "리밸런싱"}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "overview" && (
                <div className="overview-content">
                  {/* 1. chart-section 먼저 (전체 너비) */}
                  <div className="chart-section">
                    <h3>포트폴리오 구성</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          dataKey="value"
                          label={({ name, value }) => `${name} ${value}%`}
                          animationBegin={0}
                          animationDuration={1500}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 2. key-indicator와 fees-section을 좌우 배치 */}
                  <div className="metrics-section">
                    <div className="key-indicators">
                      <h3>
                        <TrendingUp size={20} />
                        핵심 투자 지표
                      </h3>
                      <div className="indicators-grid">
                        <div className="indicator-card">
                          <div className="indicator-value blue">
                            {portfolio.expectedReturn}%
                          </div>
                          <div className="indicator-label">
                            연평균 기대수익률
                          </div>
                        </div>
                        <div className="indicator-card">
                          <div className="indicator-value green">
                            {portfolio.sharpeRatio}
                          </div>
                          <div className="indicator-label">샤프 비율</div>
                        </div>
                        <div className="indicator-card">
                          <div className="indicator-value red">
                            {portfolio.maxDrawdown}%
                          </div>
                          <div className="indicator-label">최대낙폭 (MDD)</div>
                        </div>
                        <div className="indicator-card">
                          <div className="indicator-value purple">
                            {portfolio.beta}
                          </div>
                          <div className="indicator-label">
                            베타 (시장연동성)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="fees-section">
                      <h3>
                        <Shield size={20} />
                        수수료 구조
                      </h3>
                      <div className="fees-list">
                        <div className="fee-item">
                          <span>운용관리수수료 (연)</span>
                          <span className="fee-value">
                            {portfolio.fees.management}%
                          </span>
                        </div>
                        <div className="fee-item">
                          <span>성과수수료</span>
                          <span className="fee-value">
                            {portfolio.fees.performance}%
                          </span>
                        </div>
                        <div className="fee-item">
                          <span>거래수수료</span>
                          <span className="fee-value">
                            {portfolio.fees.transaction}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "allocation" && (
                <div className="allocation-content">
                  <PiePortfolioChart portfolio={portfolio} />
                </div>
              )}

              {activeTab === "performance" && (
                <div className="performance-content">
                  <div className="performance-grid">
                    <div className="performance-chart">
                      <h3>기간별 예상 성과</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            formatter={(value) => [`${value.toFixed(2)}%`, ""]}
                          />
                          <Legend />
                          <Bar
                            dataKey="portfolio"
                            fill="#1E40AF"
                            name="추천 포트폴리오"
                          />
                          <Bar
                            dataKey="benchmark"
                            fill="#10B981"
                            name="벤치마크"
                          />
                          <Bar
                            dataKey="market"
                            fill="#6B7280"
                            name="시장평균"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="simulation-section">
                      <h3>수익률 시뮬레이션</h3>
                      <div className="simulation-list">
                        {[
                          {
                            period: "월 100만원 납입",
                            years: "10년",
                            amount: "1억 2천만원",
                            return: "1억 8천만원",
                          },
                          {
                            period: "월 100만원 납입",
                            years: "20년",
                            amount: "2억 4천만원",
                            return: "4억 2천만원",
                          },
                          {
                            period: "월 100만원 납입",
                            years: "30년",
                            amount: "3억 6천만원",
                            return: "8억 5천만원",
                          },
                        ].map((sim, index) => (
                          <div key={index} className="simulation-item">
                            <div className="simulation-info">
                              <div className="simulation-period">
                                {sim.period} × {sim.years}
                              </div>
                              <div className="simulation-input">
                                총 납입: {sim.amount}
                              </div>
                            </div>
                            <div className="simulation-result">
                              <div className="simulation-return">
                                {sim.return}
                              </div>
                              <div className="simulation-label">
                                예상 수령액
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "rebalancing" && (
                <div className="rebalancing-content">
                  <div className="rebalancing-grid">
                    <div className="age-rebalancing">
                      <h3 className="portfolio-section-title">
                        연령대별 추천 포트폴리오
                      </h3>

                      <div className="age-portfolio-list">
                        {[
                          {
                            age: "20대",
                            stocks: 80,
                            bonds: 15,
                            alts: 5,
                            safe: 0,
                            type: "공격적 성장형",
                            desc: "갓 사회에 나온 사회초년생의 투자 전략은 뭘까!?",
                          },
                          {
                            age: "30대",
                            stocks: 70,
                            bonds: 20,
                            alts: 10,
                            safe: 0,
                            type: "성장형",
                            desc: "5년차 이상 직장인을 위한 전략적 연금ETF 투자법",
                          },
                          {
                            age: "40대",
                            stocks: 60,
                            bonds: 25,
                            alts: 10,
                            safe: 5,
                            type: "균형형",
                            desc: "본격적인 노후대비(IRP/ISA) 투자를 위한 포인트!",
                          },
                          {
                            age: "50대",
                            stocks: 45,
                            bonds: 35,
                            alts: 10,
                            safe: 10,
                            type: "보수형",
                            desc: "은퇴예정자에게 딱 맞춘 연금 ETF 투자 전략",
                          },
                          {
                            age: "60대+",
                            stocks: 30,
                            bonds: 45,
                            alts: 5,
                            safe: 20,
                            type: "안정형",
                            desc: "노후의 안정적 인컴을 추구하는 현명한 투자 방법",
                          },
                        ].map((ageGroup, index) => (
                          <div
                            key={index}
                            className={`age-portfolio-card ${
                              expandedAgeIndex === index ? "expanded" : ""
                            }`}
                            onClick={() =>
                              setExpandedAgeIndex(
                                expandedAgeIndex === index ? null : index
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <div className="age-header">
                              <div className="age-header-text">
                                <span className="age-range">
                                  {ageGroup.age}
                                </span>
                                <span className="portfolio-type">
                                  {ageGroup.type}
                                </span>
                                <span className="portfolio-desc-short">
                                  {ageGroup.desc}
                                </span>
                              </div>
                              <div className="age-pie-chart">
                                <ResponsiveContainer width={80} height={80}>
                                  <PieChart>
                                    <Pie
                                      data={[
                                        {
                                          name: "주식",
                                          value: ageGroup.stocks,
                                        },
                                        { name: "채권", value: ageGroup.bonds },
                                        { name: "대체", value: ageGroup.alts },
                                        { name: "안전", value: ageGroup.safe },
                                      ]}
                                      dataKey="value"
                                      innerRadius={12}
                                      outerRadius={20}
                                      isAnimationActive={true}
                                    >
                                      <Cell fill="#001E5A" /> {/* 주식 */}
                                      <Cell fill="#D70082" /> {/* 채권 */}
                                      <Cell fill="#BEBEBE" /> {/* 대체투자 */}
                                      <Cell fill="orange" /> {/* 안전자산 */}
                                    </Pie>
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {expandedAgeIndex === index && (
                              <>
                                <div className="allocation-bars">
                                  <div className="allocation-bar">
                                    <span className="asset-label">
                                      주식 {ageGroup.stocks}%
                                    </span>
                                    <div className="bar-background">
                                      <div
                                        className="bar-fill stocks"
                                        style={{ width: `${ageGroup.stocks}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="allocation-bar">
                                    <span className="asset-label">
                                      채권 {ageGroup.bonds}%
                                    </span>
                                    <div className="bar-background">
                                      <div
                                        className="bar-fill bonds"
                                        style={{ width: `${ageGroup.bonds}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  {ageGroup.alts > 0 && (
                                    <div className="allocation-bar">
                                      <span className="asset-label">
                                        대체투자 {ageGroup.alts}%
                                      </span>
                                      <div className="bar-background">
                                        <div
                                          className="bar-fill alts"
                                          style={{ width: `${ageGroup.alts}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                  {ageGroup.safe > 0 && (
                                    <div className="allocation-bar">
                                      <span className="asset-label">
                                        안전자산 {ageGroup.safe}%
                                      </span>
                                      <div className="bar-background">
                                        <div
                                          className="bar-fill safe"
                                          style={{ width: `${ageGroup.safe}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <p className="age-description"></p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rebalancing-strategy">
                      <h3>스마트 리밸런싱 전략</h3>
                      <div className="strategy-list">
                        <div className="strategy-item">
                          <div className="strategy-icon">📅</div>
                          <div className="strategy-content">
                            <h4>정기 리밸런싱</h4>
                            <p>분기별 자동 리밸런싱으로 목표 비중 유지</p>
                            <div className="strategy-detail">
                              • 3개월마다 자동 실행 • 5% 이상 이탈시 조정
                            </div>
                          </div>
                        </div>

                        <div className="strategy-item">
                          <div className="strategy-icon">🎯</div>
                          <div className="strategy-content">
                            <h4>생애주기 자동조정</h4>
                            <p>연령 증가에 따른 포트폴리오 자동 최적화</p>
                            <div className="strategy-detail">
                              • 5세 단위 자동 조정 • 리스크 점진적 감소
                            </div>
                          </div>
                        </div>

                        <div className="strategy-item">
                          <div className="strategy-icon">⚖️</div>
                          <div className="strategy-content">
                            <h4>시장상황 대응</h4>
                            <p>변동성 확대시 방어적 포지션 강화</p>
                            <div className="strategy-detail">
                              • VIX 30+ 시 채권 비중 확대 • 안전자산 비중 조정
                            </div>
                          </div>
                        </div>

                        <div className="strategy-item">
                          <div className="strategy-icon">💰</div>
                          <div className="strategy-content">
                            <h4>세금효율 리밸런싱</h4>
                            <p>절세를 고려한 스마트 매매 타이밍</p>
                            <div className="strategy-detail">
                              • 손실 실현 우선 • 장기보유 세액혜택 활용
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="next-rebalancing">
                        <h4>다음 리밸런싱 예정</h4>
                        <div className="rebalancing-schedule">
                          <div className="schedule-item">
                            <span className="schedule-date">
                              2026년 9월 30일
                            </span>
                            <button className="schedule-type-button">
                              정기 리밸런싱
                              <br />
                              알림 받기
                            </button>
                          </div>
                          <div className="schedule-note">
                            현재 포트폴리오 편차: <strong>+2.3%</strong> (기준
                            이내)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Disclosure */}
            <div className="disclosure-wrapper">
              <p className="portfolio-disclaimer">
                ⚠️ 해당 포트폴리오는 과거 데이터 기반 시뮬레이션 결과이며, 실제
                수익률이나 결과를 보장하지 않습니다.
                <br></br> 투자 결정 시 참고용으로만 활용하시기 바랍니다.
              </p>
              <br></br>
              <div className="risk-disclosure">
                <h4>
                  <AlertCircle size={20} />
                  투자 위험 고지 및 법적 공시
                </h4>
                <div className="disclosure-content">
                  <p>
                    • 본 포트폴리오는 과거 데이터 기반 모델링으로 미래 수익률을
                    보장하지 않습니다.
                  </p>
                  <p>
                    • 실적배당상품 투자 시 원금손실 가능성이 있으며,
                    예금자보호법 적용 대상이 아닙니다.
                  </p>
                  <p>
                    • IRP는 만 55세 이전 중도해지 시 기타소득세 16.5% 및
                    추가세액 부과됩니다.
                  </p>
                  <p>
                    • 투자 결정 전 상품설명서, 투자설명서 등을 반드시 확인하시기
                    바랍니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="portfolio-actions">
              <button
                onClick={() => {
                  setCurrentStep(4); // 👈 step 4(성향분석)로 돌아가기
                  setSurveyAnswers({}); // 답변 초기화
                  setPortfolio(null); // 포트폴리오 초기화
                }}
                className="action-btn secondary"
              >
                새로운 진단 시작
              </button>
              <button className="action-btn primary">
                포트폴리오 신청하기
              </button>
              <button
                onClick={() =>
                  window.open("https://www.kiwoom.com/h/main", "_blank")
                } // 👈 새 탭에서 열기
                className="action-btn tertiary"
              >
                전문가 상담 예약
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 👇 여기에 이것들을 추가하세요!
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <IntroStep />;
      case 2:
        return <QuizStep />;
      case 3:
        return (
          <QuizResultStep
            quizScore={quizScore}
            scoreInfo={getScoreLevel(quizScore)}
          />
        );
      case 4:
        return (
          <SurveyStep
            answers={surveyAnswers}
            onChange={setSurveyAnswers}
            onSubmit={generateAdvancedPortfolio}
            onPrev={() => setCurrentStep(3)}
          />
        );
      case 5:
        return <PortfolioStep portfolio={portfolio} chartData={chartData} />;
      default:
        return <IntroStep />;
    }
  };

  return (
    <div className="app-container">
      <Header />

      {currentPage === "home" && <HomePage />}
      {currentPage === "service" && (
        <div>
          {currentStep > 1 && (
            <div className="progress-section">
              <div className="progress-container">
                {[
                  { step: 1, label: "가이드" },
                  { step: 2, label: "지식평가" },
                  { step: 3, label: "결과" },
                  { step: 4, label: "성향분석" },
                  { step: 5, label: "포트폴리오" },
                ].map(({ step, label }) => (
                  <div key={step} className="progress-item">
                    <div
                      className={`progress-circle ${
                        step === currentStep
                          ? "current"
                          : step < currentStep
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      {step < currentStep ? <CheckCircle size={20} /> : step}
                    </div>
                    <span className="progress-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {renderStep()}
        </div>
      )}

      {currentPage === "guide" && <Information />}

      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-disclaimer">
            ※ 본 서비스는 KDA 1차 프로젝트 목적으로 제작되었으며, 실제 투자 결정
            시에는 전문가와 상담하시기 바랍니다.
          </p>
          <div className="footer-info">
            <span>KDA 1기</span>
            <span>2조 (은행)</span>
            <span>김하경, 박서영, 옥수연, 우동균, 이서현, 한민서</span>
          </div>
        </div>
      </footer>
    </div>
  );
}; // ← 이게 ProfessionalIRPSite 컴포넌트를 닫는 괄호

export default ProfessionalIRPSite;
