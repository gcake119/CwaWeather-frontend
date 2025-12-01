// 後端 API 基底網址（改成自己的 Zeabur 網址）
const BASE_API_URL = 'https://weather-gcake.zeabur.app/api/weather';

// DOM 元素
const citySelect = document.getElementById('citySelect');
const loadingEl = document.getElementById('loading');
const mainContentEl = document.getElementById('mainContent');
const heroCardEl = document.getElementById('heroCard');
const futureForecastsEl = document.getElementById('futureForecasts');
const updateTimeEl = document.getElementById('updateTime');

// 依天氣文字回傳 icon
function getWeatherIcon(weather) {
  if (!weather) return '🌤️';
  if (weather.includes('晴')) return '☀️';
  if (weather.includes('多雲')) return '⛅';
  if (weather.includes('陰')) return '☁️';
  if (weather.includes('雨')) return '🌧️';
  if (weather.includes('雷')) return '⛈️';
  return '🌤️';
}

// 給使用者生活建議（Doraemon 風味文案）
function getAdvice(rainProb, maxTemp) {
  const rainNum = parseInt(rainProb, 10);
  const tempNum = parseInt(maxTemp, 10);

  let rainIcon = '🌂';
  let rainText = '今天應該不用躲到任意門裡。';

  if (rainNum > 30) {
    rainIcon = '☂️';
    rainText = '大雄～帶把傘比較保險喔！';
  }

  let clothIcon = '👕';
  let clothText = '溫度剛剛好，可以輕鬆出門。';

  if (tempNum >= 28) {
    clothIcon = '🎽';
    clothText = '有點熱，短袖出發比較舒服！';
  } else if (tempNum <= 20) {
    clothIcon = '🧥';
    clothText = '有點涼，哆啦A夢叫你多帶一件外套。';
  }

  return { rainIcon, rainText, clothIcon, clothText };
}

// 判斷時間區段
function getTimePeriod(startTime) {
  const hour = new Date(startTime).getHours();
  if (hour >= 5 && hour < 11) return '早晨';
  if (hour >= 11 && hour < 14) return '中午';
  if (hour >= 14 && hour < 18) return '下午';
  if (hour >= 18 && hour < 23) return '晚上';
  return '深夜';
}

// 渲染畫面
function renderWeather(data) {
  const forecasts = data.forecasts;
  if (!forecasts || forecasts.length === 0) {
    heroCardEl.innerHTML = '<p>沒有找到天氣資料，任意門打不開了…</p>';
    futureForecastsEl.innerHTML = '';
    return;
  }

  const current = forecasts[0];
  const others = forecasts.slice(1);

  const advice = getAdvice(current.rain, current.maxTemp);
  const period = getTimePeriod(current.startTime);
  const avgTemp = Math.round(
    (parseInt(current.maxTemp, 10) + parseInt(current.minTemp, 10)) / 2
  );

  // Hero Card
  heroCardEl.innerHTML = `
    <div class="hero-card hand-drawn-box">
      <div class="bell-decoration">🔔</div>
      <div class="hero-period">${period}・${data.city}</div>
      <div class="hero-temp-container">
        <div class="hero-icon">${getWeatherIcon(current.weather)}</div>
        <div class="hero-temp">${avgTemp}°</div>
      </div>
      <div class="hero-desc">${current.weather}</div>

      <div class="advice-grid">
        <div class="advice-item">
          <div class="advice-icon">${advice.rainIcon}</div>
          <div class="advice-text">${advice.rainText}</div>
          <div style="font-size:0.75rem; color:#666;">降雨率 ${current.rain}</div>
        </div>
        <div class="advice-item">
          <div class="advice-icon">${advice.clothIcon}</div>
          <div class="advice-text">${advice.clothText}</div>
          <div style="font-size:0.75rem; color:#666;">最高溫 ${current.maxTemp}</div>
        </div>
      </div>
    </div>
  `;

  // 稍後預報卡片
  futureForecastsEl.innerHTML = '';
  const todayDate = new Date().getDate();

  others.forEach((f) => {
    let p = getTimePeriod(f.startTime);
    const fDate = new Date(f.startTime);
    if (fDate.getDate() !== todayDate) {
      p = `明天${p}`;
    }

    futureForecastsEl.innerHTML += `
      <div class="mini-card">
        <div class="mini-time">${p}</div>
        <div class="mini-icon">${getWeatherIcon(f.weather)}</div>
        <div class="mini-temp">${f.minTemp} - ${f.maxTemp}</div>
        <div style="font-size:0.8rem; color:#888; margin-top:4px;">💧${f.rain}</div>
      </div>
    `;
  });

  // 更新右上角日期
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const dayIndex = now.getDay();
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

  updateTimeEl.textContent = `${month}月${date}日 ${days[dayIndex]}`;
}

// 呼叫後端 API
async function fetchWeather(city = '臺南市') {
  try {
    // 顯示 Loading
    loadingEl.style.display = 'flex';
    mainContentEl.style.display = 'none';

    const delayPromise = new Promise((resolve) => setTimeout(resolve, 1000));
    const url = `${BASE_API_URL}?city=${encodeURIComponent(city)}`;
    const fetchPromise = fetch(url).then((res) => res.json());

    const [, json] = await Promise.all([delayPromise, fetchPromise]);

    if (json.success) {
      renderWeather(json.data);
      document.title = `${city}的天氣任意門`;
      loadingEl.style.display = 'none';
      mainContentEl.style.display = 'block';
    } else {
      throw new Error(json.message || 'API 回傳失敗');
    }
  } catch (err) {
    console.error(err);
    loadingEl.style.display = 'none';
    alert(`大雄！任意門壞掉了！(${err.message})`);
  }
}

// 監聽城市切換
citySelect.addEventListener('change', (e) => {
  const selectedCity = e.target.value;
  fetchWeather(selectedCity);
});

// 頁面載入預設查詢臺南
document.addEventListener('DOMContentLoaded', () => {
  fetchWeather('臺南市');
});
