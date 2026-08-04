function setText(selector, text) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = text;
  }
}

function setOption(value, text) {
  const option = document.querySelector(
    `option[value="${value}"]`
  );

  if (option) {
    option.textContent = text;
  }
}

function restoreKoreanUi() {
  document.title =
    "\uC655\uC219 \uD604\uC7A5 \uC704\uCE58 \uC804\uC1A1";

  setText(
    "h1",
    "\uC655\uC219 \uD604\uC7A5 \uC704\uCE58 \uC804\uC1A1"
  );

  setText(
    ".sub",
    "\uADFC\uB85C\uC790\u00B7\uC7A5\uBE44\uAE30\uC0AC \uD734\uB300\uD3F0 GPS \uC1A1\uC2E0"
  );

  setText(
    'label[for="type"]',
    "\uAD6C\uBD84"
  );

  setOption(
    "worker",
    "\uADFC\uB85C\uC790"
  );

  setOption(
    "equipment",
    "\uC7A5\uBE44"
  );

  setText(
    'label[for="equipmentType"]',
    "\uC7A5\uBE44 \uC885\uB958"
  );

  setOption("excavator", "\uAD74\uCC29\uAE30");
  setOption("dump_truck", "\uB364\uD504");
  setOption("forklift", "\uC9C0\uAC8C\uCC28");
  setOption("drilling_rig", "\uCC9C\uACF5\uAE30");
  setOption("earth_anchor_rig", "\uC5B4\uC2A4\uC575\uCE74");
  setOption("sgr_drilling_rig", "SGR\uCC9C\uACF5");
  setOption("crane", "\uD06C\uB808\uC778");
  setOption("loader", "\uB85C\uB354");
  setOption("roller", "\uB864\uB7EC");
  setOption("other", "\uAE30\uD0C0 \uC7A5\uBE44");

  setText(
    "#nameLabel",
    "\uADFC\uB85C\uC790 \uC774\uB984"
  );

  const nameInput =
    document.querySelector("#name");

  if (nameInput) {
    nameInput.placeholder =
      "\uC608: \uAE40 \uC791\uC5C5\uC790";
  }

  setText(
    ".consent-title",
    "\uAC1C\uC778\uC815\uBCF4 \uBC0F \uC704\uCE58\uC815\uBCF4 \uC774\uC6A9 \uB3D9\uC758"
  );

  setText(
    ".consent-guide",
    "\uD604\uC7A5 \uC548\uC804\uAD00\uB9AC\uC640 \uBE44\uC0C1\uC0C1\uD669 \uB300\uC751\uC744 \uC704\uD574 \uC544\uB798 \uD544\uC218 \uB0B4\uC6A9\uC744 \uD655\uC778\uD558\uACE0 \uB3D9\uC758\uD574 \uC8FC\uC138\uC694. \uAC19\uC740 \uD734\uB300\uD3F0\u00B7\uBE0C\uB77C\uC6B0\uC800\uC640 \uAC19\uC740 \uC0AC\uC6A9\uC790 \uC815\uBCF4\uC5D0\uC11C\uB294 \uCD5C\uCD08 1\uD68C\uB9CC \uB3D9\uC758\uD569\uB2C8\uB2E4."
  );

  const privacyLabel =
    document.querySelector(
      'label[for="privacyConsent"]'
    );

  if (privacyLabel) {
    privacyLabel.innerHTML =
      '<span class="required">[\uD544\uC218]</span> ' +
      '\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1\u00B7\uC774\uC6A9\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4.';
  }

  const locationLabel =
    document.querySelector(
      'label[for="locationConsent"]'
    );

  if (locationLabel) {
    locationLabel.innerHTML =
      '<span class="required">[\uD544\uC218]</span> ' +
      '\uAC1C\uC778\uC704\uCE58\uC815\uBCF4 \uC218\uC9D1\u00B7\uC774\uC6A9\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4.';
  }

  setText(
    "details summary",
    "\uB3D9\uC758 \uB0B4\uC6A9 \uC790\uC138\uD788 \uBCF4\uAE30"
  );

  const terms =
    document.querySelector(".terms");

  if (terms) {
    terms.innerHTML = `
      <strong>1. \uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1\u00B7\uC774\uC6A9</strong><br>
      \u00B7 \uC218\uC9D1 \uBAA9\uC801: \uD604\uC7A5 \uADFC\uB85C\uC790\u00B7\uC7A5\uBE44 \uC2DD\uBCC4, \uD604\uC7A5 \uC548\uC804\uAD00\uB9AC \uBC0F \uBE44\uC0C1\uC0C1\uD669 \uB300\uC751<br>
      \u00B7 \uC218\uC9D1 \uD56D\uBAA9: \uADFC\uB85C\uC790 \uC774\uB984 \uB610\uB294 \uC7A5\uBE44 \uADDC\uACA9\u00B7\uB4F1\uB85D\uBC88\uD638, \uADFC\uB85C\uC790/\uC7A5\uBE44 \uAD6C\uBD84, \uC7A5\uBE44 \uC885\uB958, \uD734\uB300\uC804\uD654 \uB2E8\uB9D0 \uC2DD\uBCC4\uAC12<br>
      \u00B7 \uC774\uC6A9 \uAE30\uAC04: \uC704\uCE58 \uC804\uC1A1 \uC2DC\uC791 \uC2DC\uC810\uBD80\uD130 \uC804\uC1A1 \uC911\uC9C0 \uC2DC\uC810\uAE4C\uC9C0<br>
      \u00B7 \uBCF4\uC720 \uAE30\uAC04: \uB2F9\uC77C \uC791\uC5C5 \uC885\uB8CC \uD6C4 \uC0AD\uC81C\uB97C \uC6D0\uCE59\uC73C\uB85C \uD558\uB418, \uC0AC\uACE0 \uC870\uC0AC \uB610\uB294 \uBC95\uB839\uC0C1 \uBCF4\uC874 \uD544\uC694 \uC2DC \uD544\uC694\uD55C \uCD5C\uC18C\uAE30\uAC04 \uBCF4\uAD00<br>
      \u00B7 \uB3D9\uC758\uB97C \uAC70\uBD80\uD560 \uC218 \uC788\uC73C\uB098 \uC2E4\uC2DC\uAC04 \uC704\uCE58 \uC548\uC804\uAD00\uB9AC \uAE30\uB2A5 \uC774\uC6A9\uC774 \uC81C\uD55C\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.

      <div class="terms-section">
        <strong>2. \uAC1C\uC778\uC704\uCE58\uC815\uBCF4 \uC218\uC9D1\u00B7\uC774\uC6A9</strong><br>
        \u00B7 \uC218\uC9D1 \uBAA9\uC801: \uD604\uC7A5 \uB0B4 \uC2E4\uC2DC\uAC04 \uC704\uCE58 \uD655\uC778, \uC704\uD5D8\uAD6C\uC5ED \uC811\uADFC \uD655\uC778 \uBC0F \uBE44\uC0C1\uC0C1\uD669 \uB300\uC751<br>
        \u00B7 \uC218\uC9D1 \uD56D\uBAA9: GPS \uC704\uB3C4\u00B7\uACBD\uB3C4, \uACE0\uB3C4, \uC704\uCE58 \uC815\uD655\uB3C4, \uC774\uB3D9\uBC29\uD5A5\u00B7\uC18D\uB3C4 \uBC0F \uC804\uC1A1\uC2DC\uAC01<br>
        \u00B7 \uC218\uC9D1 \uC2DC\uAC04: \uC704\uCE58 \uC804\uC1A1 \uC2DC\uC791 \uBC84\uD2BC\uC744 \uB204\uB978 \uC2DC\uC810\uBD80\uD130 \uC804\uC1A1 \uC911\uC9C0 \uBC84\uD2BC\uC744 \uB204\uB978 \uC2DC\uC810\uAE4C\uC9C0<br>
        \u00B7 \uB3D9\uC758 \uCCA0\uD68C: \uC804\uC1A1 \uC911\uC9C0 \uBC84\uD2BC\uC744 \uB20C\uB7EC \uC5B8\uC81C\uB4E0 \uC704\uCE58 \uC804\uC1A1\uC744 \uC911\uB2E8\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
      </div>

      <div class="terms-section">
        <strong>\uAD00\uB9AC \uC815\uBCF4</strong><br>
        \u00B7 \uD604\uC7A5: \uB0A8\uC591\uC8FC \uC655\uC219 A-6BL<br>
        \u00B7 \uC5F4\uB78C \uBC94\uC704: \uD604\uC7A5 \uC548\uC804\uAD00\uB9AC \uAD8C\uD55C\uC790<br>
        \u00B7 \uB3D9\uC758 \uBB38\uAD6C \uBC84\uC804: WANGSUK_CONSENT_2026_08_V1
      </div>
    `;
  }

  setText(
    "#consentError",
    "\uAC1C\uC778\uC815\uBCF4\uC640 \uAC1C\uC778\uC704\uCE58\uC815\uBCF4 \uD544\uC218 \uB3D9\uC758\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4."
  );

  setText(
    ".complete-title",
    "\u2713 \uAC1C\uC778\uC815\uBCF4 \uBC0F \uAC1C\uC778\uC704\uCE58\uC815\uBCF4 \uB3D9\uC758 \uC644\uB8CC"
  );

  setText(
    "#consentCompleteInfo",
    "\uB3D9\uC758 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."
  );

  setText(
    "#resetConsentBtn",
    "\uB3D9\uC758\uC790 \uBCC0\uACBD / \uB3D9\uC758 \uB2E4\uC2DC \uD558\uAE30"
  );

  setText(
    ".privacy-note",
    "\uB3D9\uC758 \uAE30\uB85D\uC740 Firebase\uC758 \uBCC4\uB3C4 \uB3D9\uC758\uAE30\uB85D \uACBD\uB85C\uC5D0 \uC800\uC7A5\uB418\uBA70 \uC2E4\uC2DC\uAC04 \uC704\uCE58\uC790\uB8CC\uC640 \uBD84\uB9AC\uD558\uC5EC \uAD00\uB9AC\uB429\uB2C8\uB2E4."
  );

  setText(
    "#startBtn",
    "\uC704\uCE58 \uC804\uC1A1 \uC2DC\uC791"
  );

  setText(
    "#stopBtn",
    "\uC804\uC1A1 \uC911\uC9C0"
  );

  setText(
    "#sendOnceBtn",
    "\uD604\uC7AC \uC704\uCE58 1\uD68C \uC804\uC1A1"
  );

  const statusRows =
    document.querySelectorAll(
      ".card.status > div"
    );

  const labels = [
    "\uC0C1\uD0DC: ",
    "\uAD6C\uBD84: ",
    "\uC704\uB3C4: ",
    "\uACBD\uB3C4: ",
    "\uACE0\uB3C4: ",
    "GPS \uC815\uD655\uB3C4: ",
    "\uB9C8\uC9C0\uB9C9 \uC804\uC1A1: ",
    "\uC804\uC1A1 \uD69F\uC218: "
  ];

  statusRows.forEach((row, index) => {
    const span = row.querySelector("span");

    if (!span || !labels[index]) {
      return;
    }

    const currentValue =
      span.textContent;

    row.textContent =
      labels[index];

    row.appendChild(span);

    span.textContent =
      currentValue;
  });

  const small =
    document.querySelector("section.card small");

  if (small) {
    small.textContent =
      "\uBCC4\uB3C4 ID \uC785\uB825\uC740 \uC5C6\uC2B5\uB2C8\uB2E4. \uC774 \uD734\uB300\uD3F0\uC5D0 \uC790\uB3D9 \uC0DD\uC131\uB41C \uB2E8\uB9D0 \uC2DD\uBCC4\uAC12\uC73C\uB85C \uC704\uCE58\uB97C \uAD6C\uBD84\uD569\uB2C8\uB2E4. \uD654\uBA74\uC774 \uAEBC\uC9C0\uAC70\uB098 \uBE0C\uB77C\uC6B0\uC800\uAC00 \uBC31\uADF8\uB77C\uC6B4\uB4DC\uB85C \uC774\uB3D9\uD558\uBA74 \uC804\uC1A1\uC774 \uC81C\uD55C\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    restoreKoreanUi
  );
} else {
  restoreKoreanUi();
}