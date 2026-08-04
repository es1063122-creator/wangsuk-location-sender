const $ = (id) => document.getElementById(id);

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

function getDeviceId() {
  let id = localStorage.getItem("wgs_device_id_v3");

  if (!id) {
    id =
      "DEVICE_" +
      crypto.randomUUID()
        .replaceAll("-", "")
        .slice(0, 16)
        .toUpperCase();

    localStorage.setItem("wgs_device_id_v3", id);
  }

  return id;
}

function setStatus(text, kind = "warn") {
  const element = $("status");
  element.textContent = text;
  element.className = `${kind} value`;
}

function updateTypeUi() {
  const isEquipment = $("type").value === "equipment";

  $("equipmentTypeWrap").classList.toggle("hidden", !isEquipment);
  $("nameLabel").textContent =
    isEquipment ? "장비 이름 또는 호기" : "근로자 이름";
  $("name").placeholder =
    isEquipment ? "예: 굴착기 1호기" : "예: 김 작업자";
  $("displayType").textContent =
    isEquipment
      ? equipmentLabels[$("equipmentType").value]
      : "근로자";
}

function readIdentity() {
  const name = $("name").value.trim();
  const type = $("type").value;
  const equipmentType =
    type === "equipment" ? $("equipmentType").value : "";

  if (!name) {
    throw new Error(
      type === "equipment"
        ? "장비 이름 또는 호기를 입력하세요."
        : "근로자 이름을 입력하세요."
    );
  }

  localStorage.setItem("wgs_tracking_name_v3", name);
  localStorage.setItem("wgs_tracking_type_v3", type);
  localStorage.setItem("wgs_equipment_type_v3", equipmentType);

  return {
    deviceId: getDeviceId(),
    name,
    type,
    equipmentType
  };
}

function loadIdentity() {
  $("name").value =
    localStorage.getItem("wgs_tracking_name_v3") ?? "";
  $("type").value =
    localStorage.getItem("wgs_tracking_type_v3") ?? "worker";
  $("equipmentType").value =
    localStorage.getItem("wgs_equipment_type_v3") ?? "excavator";

  updateTypeUi();
  setStatus("로컬 서버 연결 대기", "warn");
}

function distanceMeters(a, b) {
  if (!a || !b) return Infinity;

  const R = 6371000;
  const p1 = a.latitude * Math.PI / 180;
  const p2 = b.latitude * Math.PI / 180;
  const dp = (b.latitude - a.latitude) * Math.PI / 180;
  const dl = (b.longitude - a.longitude) * Math.PI / 180;

  const value =
    Math.sin(dp / 2) ** 2 +
    Math.cos(p1) *
      Math.cos(p2) *
      Math.sin(dl / 2) ** 2;

  return (
    2 *
    R *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    )
  );
}

function updateDisplay(position) {
  const coords = position.coords;

  $("lat").textContent = coords.latitude.toFixed(7);
  $("lng").textContent = coords.longitude.toFixed(7);
  $("alt").textContent =
    Number.isFinite(coords.altitude)
      ? `${coords.altitude.toFixed(1)} m`
      : "미수신";
  $("acc").textContent = `${coords.accuracy.toFixed(1)} m`;

  updateTypeUi();
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.error ?? `HTTP ${response.status}`);
  }

  return result;
}

async function writePosition(position, force = false) {
  const identity = readIdentity();
  const coords = position.coords;
  const now = Date.now();

  const moved = distanceMeters(
    state.lastPosition?.coords,
    coords
  );

  if (
    !force &&
    now - state.lastSentAtMs < state.minSendIntervalMs &&
    moved < state.minMoveMeters
  ) {
    return;
  }

  const payload = {
    deviceId: identity.deviceId,
    name: identity.name,
    type: identity.type,
    equipmentType: identity.equipmentType,
    equipmentTypeLabel:
      identity.equipmentType
        ? equipmentLabels[identity.equipmentType]
        : "",
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude:
      Number.isFinite(coords.altitude)
        ? coords.altitude
        : null,
    accuracy: coords.accuracy,
    heading:
      Number.isFinite(coords.heading)
        ? coords.heading
        : null,
    speed:
      Number.isFinite(coords.speed)
        ? coords.speed
        : null,
    deviceTime:
      new Date(position.timestamp).toISOString(),
    active: true
  };

  await postJson("/api/location", payload);

  state.lastPosition = position;
  state.lastSentAtMs = now;
  state.sendCount += 1;

  $("sentAt").textContent =
    new Date().toLocaleTimeString();
  $("count").textContent = String(state.sendCount);

  setStatus("현장 PC로 전송 중", "ok");
}

function onPosition(position) {
  updateDisplay(position);

  writePosition(position).catch(error => {
    console.error(error);
    setStatus(`전송 오류: ${error.message}`, "bad");
  });
}

function onPositionError(error) {
  const messages = {
    1: "위치 권한이 거부되었습니다.",
    2: "현재 위치를 확인할 수 없습니다.",
    3: "GPS 확인 시간이 초과되었습니다."
  };

  setStatus(
    messages[error.code] ?? error.message,
    "bad"
  );
}

function startTracking() {
  try {
    readIdentity();
  } catch (error) {
    setStatus(error.message, "bad");
    return;
  }

  if (!navigator.geolocation) {
    setStatus(
      "이 휴대폰은 위치 기능을 지원하지 않습니다.",
      "bad"
    );
    return;
  }

  if (state.watchId !== null) return;

  setStatus("GPS 확인 중", "warn");

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
    navigator.geolocation.clearWatch(state.watchId);
    state.watchId = null;
  }

  try {
    const identity = readIdentity();

    await postJson("/api/location", {
      deviceId: identity.deviceId,
      name: identity.name,
      type: identity.type,
      equipmentType: identity.equipmentType,
      equipmentTypeLabel:
        identity.equipmentType
          ? equipmentLabels[identity.equipmentType]
          : "",
      latitude:
        state.lastPosition?.coords.latitude ?? 0,
      longitude:
        state.lastPosition?.coords.longitude ?? 0,
      altitude:
        state.lastPosition?.coords.altitude ?? null,
      accuracy:
        state.lastPosition?.coords.accuracy ?? 0,
      active: false,
      deviceTime: new Date().toISOString()
    });

    await postJson("/api/event", {
      eventType: "tracking_stopped",
      deviceId: identity.deviceId,
      name: identity.name,
      type: identity.type
    });
  } catch (error) {
    console.warn(error);
  }

  $("startBtn").disabled = false;
  $("stopBtn").disabled = true;
  setStatus("전송 중지", "warn");
}

function sendOnce() {
  try {
    readIdentity();
  } catch (error) {
    setStatus(error.message, "bad");
    return;
  }

  setStatus("현재 위치 확인 중", "warn");

  navigator.geolocation.getCurrentPosition(
    position => {
      updateDisplay(position);

      writePosition(position, true).catch(error => {
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

$("type").addEventListener("change", updateTypeUi);
$("equipmentType").addEventListener("change", updateTypeUi);
$("startBtn").addEventListener("click", startTracking);
$("stopBtn").addEventListener("click", stopTracking);
$("sendOnceBtn").addEventListener("click", sendOnce);

loadIdentity();
