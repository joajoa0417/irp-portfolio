import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import "./information.css";

// --- 최상단 네비+소개 컴포넌트 ---
function InfoHeader() {
  return (
    <header className="irp-header">
      <div className="irp-hero-title">
        <br />
        <br />
        <span>
          더 똑똑한{" "}
          <span className="irp-hero-highlight">IRP(개인형 퇴직연금) 투자!</span>{" "}
          키움로드
        </span>
      </div>
      <div className="irp-hero-desc">
        개인별 특성에 맞는, 체계적인 포트폴리오 설계로 <br />
        은퇴까지 긴 금융 여정에 신뢰할 수 있는 파트너가 되어드리겠습니다.
      </div>
    </header>
  );
}

// --- 서비스 소개 부분 ---
function ServiceIntro() {
  return (
    <div className="">
      <div className="intro-title">
        <h1 className="ri-title">
          <span className="intro-highlight">
            '키움로드'의 퇴직연금 추천 포트폴리오
          </span>
          는 <br />
          이런 서비스에요
        </h1>
      </div>
      <br />
      <div className="intro-card-list">
        <div className="intro-card">
          <div className="intro-card-icon">📈</div>
          <div className="intro-card-txt">
            <h2>
              초개인화 성향
              <br /> 맞춤 포트폴리오 제안
            </h2>
            <br />
            전문가가 설계한 알고리즘 기반의
            <br />
            포트폴리오 및 리밸런싱안 설계
          </div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">💡</div>
          <div className="intro-card-txt">
            <h2>
              재투자효과를 위한
              <br /> 투자 알림 서비스
            </h2>
            <br />
            투자중인 상품에 대한 정기적 뉴스로
            <br />
            실시간 시장 변화 대응
            {/* 🥧채권 등으로 구성된 펀드 또는<br />
              ETF에 분산 투자 */}
          </div>
        </div>
        <div className="intro-card">
          <div className="intro-card-icon">🏦</div>
          <div className="intro-card-txt">
            <h2>
              키움증권 투자 전문가의
              <br /> 맞춤 상담 서비스
            </h2>
            <br />
            직접 투자가 어려운 초보자라면?
            <br />
            키움증권 계좌 상담 & 일임 가능
          </div>
        </div>
      </div>
      <br />
      <h2 className="ri-subtitle2">
        키움로드는 계좌 개설 시에만 포트폴리오를 추천하는 솔루션이 아니라,
        경제적 상황/연령대 변화에 따라 <br />
        고객이 유동적으로 포트폴리오 구성을 변경할 수 있게 시기별 맞춤
        포트폴리오를 추천해주는 서비스입니다.
      </h2>
      <br />

      {/* // --- 퇴직연금 설명 부분 --- */}

      <div className="white-bg-section">
        <h1 className="ri-title">퇴직연금(IRP) 투자의 중요성</h1>

        <h2 className="ri-subtitle">
          “나중에”가 아니라, 오늘 조금만 시작해도 훨씬 달라져요.
          <br />
          <b>IRP</b>는 <b>세금 혜택도 챙기고, 장기 투자 효과</b>도 얻을 수 있는
          노후 준비의 첫 걸음이에요.
          <br />
          <br />
          <span className="ri-accent">
            <i>'지금'부터 준비하면, 노후의 여유와 안정이 달라져요.</i>
          </span>
        </h2>
        <br />
        <div className="intro-bottom-box">
          <div className="intro-bottom-card">
            <div className="intro-bottom-left">
              <div className="intro-card-icon big">💸</div>
              <div>
                세액공제 혜택을 받을 수 있어요
                <br />
                <span className="intro-bottom-remark">
                  (1년 1회한, 최대 148.5만원)
                </span>
              </div>
            </div>
            <div className="intro-bottom-table-wrap">
              <table className="intro-bottom-table">
                <thead>
                  <tr>
                    <th>총급여</th>
                    <th>세액공제율</th>
                    <th>세액공제한도</th>
                    <th>공제금액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>5,500만원 이하</td>
                    <td>16.5%</td>
                    <td>900만원</td>
                    <td>최대 148.5만원</td>
                  </tr>
                  <tr>
                    <td>5,500만원 초과</td>
                    <td>13.2%</td>
                    <td>900만원</td>
                    <td>최대 118.8만원</td>
                  </tr>
                </tbody>
              </table>
              <div className="intro-bottom-caption">
                ※IRP 단독 또는 연금저축계좌와 합산
              </div>
            </div>
          </div>
        </div>
        {/* <br />
      <br />
      <br /> */}
      </div>
    </div>
  );
}

// --- Information 함수 바깥에 상세 data 및 디자인 별도 선언 ---
const CustomBarLabel = (props) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width - 7} // bar 끝에서 5px 오른쪽
      y={y + 15} // 막대 중앙 (barSize에 따라 조정)
      fill="#fff"
      fontSize={14}
      textAnchor="end"
    >
      {value}만
    </text>
  );
};

const progressData = [
  { period: "월 10만원", value: 19.8 },
  { period: "월 20만원", value: 39.6 },
  { period: "월 75만원", value: 148.5 },
];

// --- 연령별 카드뉴스 부분 ---
function Information() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <>
      <InfoHeader />
      <div className="ri-main">
        <ServiceIntro />
        <br />
        <br />
        <h1 className="ri-title">퇴직연금 투자 상세 안내</h1>
        <h2 className="ri-subtitle">
          연령대별 퇴직연금(IRP) 설계 방법을 추천드려요.
          <br />
          <br />
          연금 수령까지 남은 시간과 중도 이벤트 발생에 따라 투자 방법은 계속
          바뀔 수 있습니다.
          <br />
          <b>
            <i>아래의 예시 </i>
          </b>
          를 확인하여 상황에 맞게 연금 투자 방법을 바꿔보세요.
        </h2>
        <div className="ri-card-list">
          {ageCards.map((card, idx) => (
            <div
              className={`ri-card ${activeIdx === idx ? "active" : ""}`}
              key={card.label}
              onClick={() => setActiveIdx(idx)}
            >
              {/* 연령대별 이미지 */}
              <img src={card.image} alt={card.label} className="ri-card-img" />

              <div className="ri-card-label">{card.label}</div>
              <div className="ri-card-sub">{card.subtitle}</div>
            </div>
          ))}
        </div>
        <div className="ri-detail-box">{ageCards[activeIdx].detail}</div>
      </div>
    </>
  );
}

// --- 카드뉴스 ---
const ageCards = [
  {
    image: "20대.png",
    label: "20대",
    subtitle: "사회초년생, 지금 연금이 너무 빠르다고요? ",
    // subtitle: "복리의 기적, 지금부터 준비!",
    detail: (
      <>
        <strong>“지금 월 10만원이면, 나중엔 1억을 만들 수도 있어요!”</strong>
        <ul>
          <li>
            <b>20대</b>는 <u>'복리의 기적'</u>을 만들 수 있는 최고의 시기예요.
          </li>
          <li>
            지금은 매월 조금씩 적립해도 나중에 눈덩이처럼 커질 수 있는 ‘복리
            효과’ 때문이죠.
          </li>
          <br />
          <li>예를 들어볼게요.</li>
          <li>
            <b>매달 10만원씩 30년간</b> 넣으면 원금은 총 3,600만원이지만,
          </li>
          <li>
            연 6% 수익으로 복리로 굴리면 <b>7,000만원 이상</b> 받을 수 있어요.
          </li>
        </ul>

        {/* → 가로 막대 차트: 원금 vs 복리 최종액 */}
        <div className="chart-section">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={[
                { name: "원금", value: 3600 },
                { name: "복리(연6%)", value: 7000 },
              ]}
              layout="vertical"
              margin={{ left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="만원" />
              <YAxis dataKey="name" type="category" width={80} />
              <ReTooltip formatter={(v) => `${v}만원`} />
              <Bar
                dataKey="value"
                fill="#D70082"
                barSize={20}
                label={<CustomBarLabel />}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-caption">10만원×30년 / 복리 vs 원금 비교</div>
        </div>

        {/* <div className="ri-chart-bar">
          <div className="ri-bar-20s" style={{ width: "80%" }}>복리 7,000만</div>
          <div className="ri-bar-sum" style={{ width: "40%" }}>원금 3,600만</div>
        </div> */}

        <br />
        <table className="ri-table">
          <tr>
            <th>투자 기간</th>
            <th>원금(총)</th>
            <th>복리 수익금(총)</th>
          </tr>
          <tr>
            <td>10년</td>
            <td>1,200만원</td>
            <td>
              <b>1,630만원</b>
            </td>
          </tr>
          <tr>
            <td>20년</td>
            <td>2,400만원</td>
            <td>
              <b>4,400만원</b>
            </td>
          </tr>
          <tr>
            <td>30년</td>
            <td>3,600만원</td>
            <td>
              <b>7,000만원↑</b>
            </td>
          </tr>
        </table>
        <br />
        <br />
        <p>
          <b>#적은 금액도 꾸준하게! #시간은 나의 친구!</b>{" "}
          <span className="ri-accent">
            ‘늦게 시작할수록 복리 효과는 작아져요.’
          </span>
        </p>
      </>
    ),
  },
  {
    image: "30대.png",
    label: "30대",
    subtitle: "결혼, 주택마련.. 가장 돈 나갈 곳이 많은 시기죠?",
    detail: (
      <>
        <strong>“적은 돈으로 연금을 넣어도 세금부터 돌려받아요!”</strong>
        <ul>
          <li>
            <b>30대</b>는 돈 쓸 일이 정말 많죠.{" "}
            <u>결혼 자금, 육아비, 주택 마련...</u>
          </li>
          <li>
            이럴 땐 <b>세금 혜택</b>을 가장 잘 활용하는 게 중요해요.
          </li>
          <br />
          <li>
            IRP는 연말정산 때 <b>최대 16.5% 세액공제</b>를 받을 수 있어서,
          </li>
          <li>
            월 10만원씩 연 120만원만 넣어도 매년 <b>19만8천원</b>을 돌려받게
            되죠.
          </li>
          {/* <li>주택청약·청년우대 등 <span className="ri-accent">다른 저축과 함께 분산해도 OK!</span></li> */}
        </ul>

        {/* 바 차트 */}
        <div className="chart-section">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={progressData}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 120]}
                tickFormatter={(v) => `${v}만`}
              />
              <YAxis
                dataKey="period"
                type="category"
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <ReTooltip formatter={(v) => `${v}만원`} />
              <Bar
                dataKey="value"
                fill="#10B981"
                barSize={20}
                name="환급금(만원)"
                label={<CustomBarLabel />}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-caption">연간 납입액별 세액 환급금 예시</div>
        </div>

        <table className="ri-table">
          <tr>
            <th>월 납입액</th>
            <th>연간 납입액</th>
            <th>세액 환급금</th>
          </tr>
          <tr>
            <td>월 10만원</td>
            <td>120만원</td>
            <td>
              <b>19만8천원</b>
            </td>
          </tr>
          <tr>
            <td>월 15만원</td>
            <td>180만원</td>
            <td>
              <b>29만7천원</b>
            </td>
          </tr>
          <tr>
            <td>월 20만원</td>
            <td>240만원</td>
            <td>
              <b>39만6천원</b>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>...</td>
            <td>
              <b></b>
            </td>
          </tr>
          <tr>
            <td>월 75만원</td>
            <td>900만원</td>
            <td>
              <b>148만5천원</b>
            </td>
          </tr>
        </table>
        <br />
        <li>
          총 급여 5,500만원(근로소득만 있는 경우) 이하 또는 종합소득금액
          4,500만원 이하인 경우 (15.4%)
        </li>
      </>
    ),
  },
  {
    image: "40대.png",
    label: "40대",
    subtitle: "노후준비 본격 시동 걸어야 할 때!",
    detail: (
      <>
        <strong>“지금부터 제대로 준비해야 나중이 편해요.”</strong>
        <ul>
          <li>
            <b>40대</b>는 은퇴까지 20년 정도 남은 <u>중요한 시기</u>입니다.
          </li>
          <li>
            지금부터 목표한 노후 생활비를 계산하고, IRP로 부족한 부분을 채우는
            게 좋습니다.
          </li>
          <br />
          <li>
            매년 IRP와 연금저축으로 최대 <b>900만원</b>까지 납입하면 최대{" "}
            <b>148만5천원</b>을 세금에서 돌려받을 수 있어요.
          </li>
          <li>
            중도 인출은 노후 불안의 지름길! 가급적 해지하지 말고 유지하세요.
          </li>
        </ul>

        {/* <div className="ri-chart-bar">
          <div className="ri-bar-40s" style={{ width: "70%" }}>연금 준비율</div>
        </div> */}

        {/* → 누적 가로 막대: IRP+연금저축 최대 한도 대비 환급 */}
        <div className="chart-section">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={[
                { name: "한도 900만원", refund: 148.5 },
                { name: "한도 300만원", refund: 49.5 },
              ]}
              layout="vertical"
              margin={{ left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="만원" />
              <YAxis dataKey="name" type="category" width={100} />
              <ReTooltip formatter={(v) => `${v}만원`} />
              <Bar
                dataKey="refund"
                fill="#3B82F6"
                barSize={20}
                label={<CustomBarLabel />}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-caption">
            최대 한도 환급금 예시 (총 급여 5,500만원 이하 기준)
          </div>
        </div>

        <table className="ri-table">
          <thead>
            <tr>
              <th>총 납입한도</th>
              <th>공제율</th>
              <th>세액 환급</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>900만원</td>
              <td>16.5%</td>
              <td>
                <b>148만5천원</b>
              </td>
            </tr>
            <tr>
              <td>600만원</td>
              <td>16.5%</td>
              <td>
                <b>99만원</b>
              </td>
            </tr>
            <tr>
              <td>300만원</td>
              <td>16.5%</td>
              <td>
                <b>49만5천원</b>
              </td>
            </tr>
          </tbody>
        </table>
        <li>
          총 급여 5,500만원(근로소득만 있는 경우) 이하 또는 종합소득금액
          4,500만원 이하인 경우
        </li>

        <table className="ri-table">
          <thead>
            <tr>
              <th>총 납입한도</th>
              <th>공제율</th>
              <th>세액 환급</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>900만원</td>
              <td>13.2%</td>
              <td>
                <b>118만8천원</b>
              </td>
            </tr>
            <tr>
              <td>600만원</td>
              <td>13.2%</td>
              <td>
                <b>79만2천원</b>
              </td>
            </tr>
            <tr>
              <td>300만원</td>
              <td>13.2%</td>
              <td>
                <b>39만6만만원</b>
              </td>
            </tr>
          </tbody>
        </table>
        <li>
          총 급여 5,500만원(근로소득만 있는 경우) 초과 또는 종합소득금액
          4,500만원 초과인 경우
        </li>

        <br />
        <p>
          <b>#노후대비는 지금이 골든타임! </b>
          <span className="ri-accent"># IPR+연금저축</span>
        </p>
      </>
    ),
  },
  {
    image: "50대.png",
    label: "50대 이상",
    subtitle: "은퇴가 현실로 다가왔어요. 전략을 바꿔야 할 때!",
    detail: (
      <>
        <strong>“이제는 안전하게, 연금을 어떻게 받을지 고민해봐요.”</strong>
        <ul>
          <li>
            <b>50대</b> 이후엔 <u>투자 전략</u>을 확 바꿀 때입니다.
          </li>
          <li>
            위험한 투자 자산 비중을 낮추고, <b>안정적인 상품(채권형·예금 등)</b>{" "}
            으로 전환하는 것이 좋죠.
          </li>
          <br />
          <li>또한 연금 수령 방식을 내 상황에 맞게 선택할 수 있어요.</li>
          <li>
            <span className="ri-accent">
              ‘종신형’(평생 지급) VS ‘확정형’(정해진 기간 동안 지급)
            </span>{" "}
            중 무엇이 나에게 맞을지 고민해 보세요.
          </li>
          {/* <li>퇴직 후 목돈 인출은 신중히, <b>분할 연금수령</b>이 유리한 경우가 많습니다.</li> */}
        </ul>

        {/* → 가로 막대: 월 수령액 비교 */}
        <div className="chart-section">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={[
                { name: "종신형(평생)", payment: 45 },
                { name: "확정형(20년)", payment: 70 },
              ]}
              layout="vertical"
              margin={{ left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="만원" />
              <YAxis dataKey="name" type="category" width={100} />
              <ReTooltip formatter={(v) => `${v}만원`} />
              <Bar
                dataKey="payment"
                fill="#363666"
                barSize={20}
                label={<CustomBarLabel />}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-caption">
            연금 월 수령액 비교 (총 적립금 약 1억 6800만원 기준)
          </div>
        </div>

        <table className="ri-table">
          <tr>
            <th>연금수령방식</th>
            <th>지급기간</th>
            <th>추천대상</th>
          </tr>
          <tr>
            <td>
              <b>종신형</b>
            </td>
            <td>평생</td>
            <td>안정적인 현금흐름을 원하는 사람</td>
          </tr>
          <tr>
            <td>
              <b>확정형</b>
            </td>
            <td>10년, 20년 등</td>
            <td>목돈 활용 계획이 있는 사람</td>
          </tr>
        </table>
      </>
    ),
  },
];

export default Information;
