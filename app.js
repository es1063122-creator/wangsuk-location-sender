import { firebaseConfig } from "./firebase-config.js?v=8";

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const $ = (id) => document.getElementById(id);

const CONSENT_VERSION =
  "WANGSUK_CONSENT_2026_08_V1";

const CONSENT_LOCAL_KEY =
  "wgs_consent_record_v1";

const equipmentLabels = {
  excavator: "굴착기",
  dump_truck: "덤프",
  forklift: "지게차",
  drilling_rig: "천공기",
  earth_anchor_rig: "어스앵카",
  sgr_drilling_rig: "SGR천공",
  crane: "크레인",
  loader: "로더",
  roller: "롤러",
  other: "기타 장비"
};

const state = {
  watchId: null,
  lastPosition: null,
  lastSentAtMs: 0,
  sendCount: 0,
  minSendIntervalMs: 10000,
  minMoveMeters: 3.0
};

const firebaseApp =
  initializeApp(firebaseConfig);

const database =
  getDatabase(firebaseApp);

function getDeviceId() {
  let deviceId =
    localStorage.getItem(
      "wgs_device_id_firebase_v1"
    );

  if (!deviceId) {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      deviceId =
        "DEVICE_" +
        window.crypto.randomUUID()
          .replaceAll("-", "")
          .slice(0, 16)
          .toUpperCase();
    } else {
      deviceId =
        "DEVICE_" +
        Date.now().toString(16).toUpperCase() +
        Math.random()
          .toString(16)
          .slice(2, 8)
          .toUpperCase();
    }

    localStorage.setItem(
      "wgs_device_id_firebase_v1",
      deviceId
    );
  }

  return deviceId;
}

function setStatus(
  text,
  kind = "warn"
) {
  const element = $("status");

  if (!element) {
    return;
  }

  element.textContent = text;
  element.className = `${kind} value`;
}

function updateTypeUi() {
  const isEquipment =
    $("type").value === "equipment";

  $("equipmentTypeWrap").classList.toggle(
    "hidden",
    !isEquipment
  );

  $("nameLabel").textContent =
    isEquipment
      ? "장비 규격 및 등록번호"
      : "근로자 이름";

  $("name").placeholder =
    isEquipment
      ? "예: 06굴착기 1234"
      : "예: 김 작업자";

  $("displayType").textContent =
    isEquipment
      ? equipmentLabels[
          $("equipmentType").value
        ]
      : "근로자";
}

function readIdentity() {
  const deviceId = getDeviceId();
  const name = $("name").value.trim();
  const type = $("type").value;

  const equipmentType =
    type === "equipment"
      ? $("equipmentType").value
      : "";

  if (!name) {
    throw new Error(
      type === "equipment"
        ? "장비 규격과 등록번호 4자리를 입력하세요."
        : "근로자 이름을 입력하세요."
    );
  }

  localStorage.setItem(
    "wgs_tracking_name_firebase_v1",
    name
  );

  localStorage.setItem(
    "wgs_tracking_type_firebase_v1",
    type
  );

  localStorage.setItem(
    "wgs_equipment_type_firebase_v1",
    equipmentType
  );

  return {
    deviceId,
    name,
    type,
    equipmentType
  };
}

function identitySignature(identity) {
  return [
    identity.deviceId,
    identity.name,
    identity.type,
    identity.equipmentType || ""
  ].join("|");
}

function readLocalConsent() {
  const raw =
    localStorage.getItem(
      CONSENT_LOCAL_KEY
    );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(
      "동의 기록 읽기 오류",
      error
    );

    return null;
  }
}

function saveLocalConsent(record) {
  localStorage.setItem(
    CONSENT_LOCAL_KEY,
    JSON.stringify(record)
  );
}

function clearLocalConsent() {
  localStorage.removeItem(
    CONSENT_LOCAL_KEY
  );
}

function consentMatchesIdentity(
  consent,
  identity
) {
  if (!consent || !identity) {
    return false;
  }

  return (
    consent.consentGiven === true &&
    consent.consentVersion ===
      CONSENT_VERSION &&
    consent.identitySignature ===
      identitySignature(identity)
  );
}

function getIdentityForUi() {
  return {
    deviceId: getDeviceId(),
    name: $("name")?.value.trim() || "",
    type: $("type")?.value || "worker",

    equipmentType:
      $("type")?.value === "equipment"
        ? $("equipmentType")?.value || ""
        : ""
  };
}

function updateConsentUi() {
  const inputArea =
    $("consentInputArea");

  const completeArea =
    $("consentCompleteArea");

  if (!inputArea || !completeArea) {
    return;
  }

  const identity =
    getIdentityForUi();

  const consent =
    readLocalConsent();

  const completed =
    consentMatchesIdentity(
      consent,
      identity
    );

  inputArea.classList.toggle(
    "hidden",
    completed
  );

  completeArea.classList.toggle(
    "hidden",
    !completed
  );

  if (
    completed &&
    $("consentCompleteInfo")
  ) {
    $("consentCompleteInfo").textContent =
      `동의자: ${consent.name} · 동의일: ${consent.consentDate}`;
  }
}

async function ensureConsent(identity) {
  const saved =
    readLocalConsent();

  if (
    consentMatchesIdentity(
      saved,
      identity
    )
  ) {
    return saved;
  }

  const privacyChecked =
    $("privacyConsent")?.checked === true;

  const locationChecked =
    $("locationConsent")?.checked === true;

  if (
    !privacyChecked ||
    !locationChecked
  ) {
    $("consentError")?.classList.add(
      "show"
    );

    throw new Error(
      "개인정보와 개인위치정보 필수 동의가 필요합니다."
    );
  }

  $("consentError")?.classList.remove(
    "show"
  );

  const now = new Date();

  const consentDate =
    now.getFullYear().toString() +
    "-" +
    String(
      now.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      now.getDate()
    ).padStart(2, "0");

  const firebaseRecord = {
    deviceId: identity.deviceId,
    name: identity.name,
    type: identity.type,

    equipmentType:
      identity.equipmentType || "",

    equipmentTypeLabel:
      identity.equipmentType
        ? equipmentLabels[
            identity.equipmentType
          ]
        : "",

    privacyConsent: true,
    locationConsent: true,
    consentGiven: true,

    consentVersion:
      CONSENT_VERSION,

    consentDate,

    consentDeviceTime:
      now.toISOString(),

    consentAt:
      serverTimestamp(),

    identitySignature:
      identitySignature(identity),

    site:
      "남양주 왕숙 A-6BL",

    purpose:
      "현장 안전관리 및 비상상황 대응",

    revoked: false
  };

  await set(
    ref(
      database,
      `consents/${identity.deviceId}`
    ),
    firebaseRecord
  );

  const localRecord = {
    ...firebaseRecord,
    consentAt: Date.now()
  };

  saveLocalConsent(localRecord);
  updateConsentUi();

  return localRecord;
}

function resetConsentForNewUser() {
  clearLocalConsent();

  if ($("privacyConsent")) {
    $("privacyConsent").checked = false;
  }

  if ($("locationConsent")) {
    $("locationConsent").checked = false;
  }

  $("consentError")?.classList.remove(
    "show"
  );

  updateConsentUi();

  setStatus(
    "새 동의자 정보를 입력하고 다시 동의해 주세요.",
    "warn"
  );
}

function loadIdentity() {
  $("name").value =
    localStorage.getItem(
      "wgs_tracking_name_firebase_v1"
    ) ?? "";

  $("type").value =
    localStorage.getItem(
      "wgs_tracking_type_firebase_v1"
    ) ?? "worker";

  $("equipmentType").value =
    localStorage.getItem(
      "wgs_equipment_type_firebase_v1"
    ) ?? "excavator";

  updateTypeUi();
  updateConsentUi();

  setStatus(
    "Firebase 연결 중",
    "warn"
  );
}

function distanceMeters(
  pointA,
  pointB
) {
  if (!pointA || !pointB) {
    return Infinity;
  }

  const earthRadius = 6371000;

  const latitude1 =
    pointA.latitude * Math.PI / 180;

  const latitude2 =
    pointB.latitude * Math.PI / 180;

  const deltaLatitude =
    (pointB.latitude - pointA.latitude) *
    Math.PI / 180;

  const deltaLongitude =
    (pointB.longitude - pointA.longitude) *
    Math.PI / 180;

  const value =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) *
    Math.cos(latitude2) *
    Math.sin(deltaLongitude / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    )
  );
}

function updateDisplay(position) {
  const coords = position.coords;

  $("lat").textContent =
    coords.latitude.toFixed(7);

  $("lng").textContent =
    coords.longitude.toFixed(7);

  $("alt").textContent =
    Number.isFinite(coords.altitude)
      ? `${coords.altitude.toFixed(1)} m`
      : "미수신";

  $("acc").textContent =
    `${coords.accuracy.toFixed(1)} m`;

  updateTypeUi();
}

function createPayload(
  identity,
  coords,
  active
) {
  return {
    deviceId: identity.deviceId,
    name: identity.name,
    type: identity.type,

    equipmentType:
      identity.equipmentType,

    equipmentTypeLabel:
      identity.equipmentType
        ? equipmentLabels[
            identity.equipmentType
          ]
        : "",

    latitude:
      Number.isFinite(coords?.latitude)
        ? coords.latitude
        : 0,

    longitude:
      Number.isFinite(coords?.longitude)
        ? coords.longitude
        : 0,

    altitude:
      Number.isFinite(coords?.altitude)
        ? coords.altitude
        : null,

    accuracy:
      Number.isFinite(coords?.accuracy)
        ? coords.accuracy
        : 0,

    heading:
      Number.isFinite(coords?.heading)
        ? coords.heading
        : null,

    speed:
      Number.isFinite(coords?.speed)
        ? coords.speed
        : null,

    deviceTime:
      new Date().toISOString(),

    receivedAt:
      serverTimestamp(),

    active
  };
}

async function writePosition(
  position,
  force = false
) {
  const identity =
    readIdentity();

  await ensureConsent(identity);

  const coords = position.coords;
  const now = Date.now();

  const movedDistance =
    distanceMeters(
      state.lastPosition?.coords,
      coords
    );

  if (
    !force &&
    now - state.lastSentAtMs <
      state.minSendIntervalMs &&
    movedDistance <
      state.minMoveMeters
  ) {
    return;
  }

  const payload =
    createPayload(
      identity,
      coords,
      true
    );

  await set(
    ref(
      database,
      `tracking/latest/${identity.deviceId}`
    ),
    payload
  );

  state.lastPosition = position;
  state.lastSentAtMs = now;
  state.sendCount += 1;

  $("sentAt").textContent =
    new Date().toLocaleTimeString();

  $("count").textContent =
    String(state.sendCount);

  setStatus(
    "Firebase로 전송 중",
    "ok"
  );
}

function onPosition(position) {
  updateDisplay(position);

  writePosition(position).catch(
    error => {
      console.error(error);

      setStatus(
        `전송 오류: ${error.message}`,
        "bad"
      );
    }
  );
}

function onPositionError(error) {
  const messages = {
    1: "위치 권한이 거부되었습니다.",
    2: "현재 위치를 확인할 수 없습니다.",
    3: "GPS 확인 시간이 초과되었습니다."
  };

  setStatus(
    messages[error.code] ??
      error.message,
    "bad"
  );
}

async function startTracking() {
  try {
    const identity =
      readIdentity();

    setStatus(
      "동의 기록 확인 중",
      "warn"
    );

    await ensureConsent(identity);
  } catch (error) {
    console.error(error);

    setStatus(
      `시작 오류: ${error.message}`,
      "bad"
    );

    return;
  }

  if (!navigator.geolocation) {
    setStatus(
      "이 휴대폰은 위치 기능을 지원하지 않습니다.",
      "bad"
    );

    return;
  }

  if (state.watchId !== null) {
    return;
  }

  setStatus(
    "GPS 확인 중",
    "warn"
  );

  state.watchId =
    navigator.geolocation.watchPosition(
      onPosition,
      onPositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    );

  $("startBtn").disabled = true;
  $("stopBtn").disabled = false;
}

async function stopTracking() {
  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(
      state.watchId
    );

    state.watchId = null;
  }

  try {
    const identity =
      readIdentity();

    const payload =
      createPayload(
        identity,
        state.lastPosition?.coords,
        false
      );

    await set(
      ref(
        database,
        `tracking/latest/${identity.deviceId}`
      ),
      payload
    );
  } catch (error) {
    console.warn(error);
  }

  $("startBtn").disabled = false;
  $("stopBtn").disabled = true;

  setStatus(
    "전송 중지",
    "warn"
  );
}

async function sendOnce() {
  try {
    const identity =
      readIdentity();

    setStatus(
      "동의 기록 확인 중",
      "warn"
    );

    await ensureConsent(identity);
  } catch (error) {
    setStatus(
      `전송 오류: ${error.message}`,
      "bad"
    );

    return;
  }

  if (!navigator.geolocation) {
    setStatus(
      "위치 기능을 사용할 수 없습니다.",
      "bad"
    );

    return;
  }

  setStatus(
    "현재 위치 확인 중",
    "warn"
  );

  navigator.geolocation.getCurrentPosition(
    position => {
      updateDisplay(position);

      writePosition(
        position,
        true
      ).catch(error => {
        console.error(error);

        setStatus(
          `전송 오류: ${error.message}`,
          "bad"
        );
      });
    },
    onPositionError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );
}

$("name")?.addEventListener(
  "input",
  updateConsentUi
);

$("type")?.addEventListener(
  "change",
  () => {
    updateTypeUi();
    updateConsentUi();
  }
);

$("equipmentType")?.addEventListener(
  "change",
  () => {
    updateTypeUi();
    updateConsentUi();
  }
);

$("privacyConsent")?.addEventListener(
  "change",
  () => {
    $("consentError")?.classList.remove(
      "show"
    );
  }
);

$("locationConsent")?.addEventListener(
  "change",
  () => {
    $("consentError")?.classList.remove(
      "show"
    );
  }
);

$("resetConsentBtn")?.addEventListener(
  "click",
  resetConsentForNewUser
);

$("startBtn").addEventListener(
  "click",
  startTracking
);

$("stopBtn").addEventListener(
  "click",
  stopTracking
);

$("sendOnceBtn").addEventListener(
  "click",
  sendOnce
);

loadIdentity();