//Your JavaScript goes in here

const canvas = document.getElementById("experimentCanvas");
const ctx = canvas.getContext("2d");

const angleSlider = document.getElementById("angleSlider");
const materialSelect = document.getElementById("materialSelect");
const polarization = document.getElementById("polarization");

const angleValue = document.getElementById("angleValue");
const brewsterValue = document.getElementById("brewsterValue");
const reflectionValue = document.getElementById("reflectionValue");
const refractionValue = document.getElementById("refractionValue");
const intensityValue = document.getElementById("intensityValue");
const statusBox = document.getElementById("status");
const observationBody = document.getElementById("observationBody");

const W = 800;
const H = 470;
const n1 = 1.0;
let readings = [];

canvas.width = W;
canvas.height = H;

function deg(rad) {
  return rad * 180 / Math.PI;
}

function rad(degrees) {
  return degrees * Math.PI / 180;
}

function currentValues() {
  const thetaI = Number(angleSlider.value);
  const n2 = Number(materialSelect.value);
  const thetaB = deg(Math.atan(n2 / n1));

  const sinT = (n1 / n2) * Math.sin(rad(thetaI));
  const thetaT = deg(Math.asin(Math.max(-1, Math.min(1, sinT))));

  // Fresnel amplitude reflection coefficients.
  const cosI = Math.cos(rad(thetaI));
  const cosT = Math.cos(rad(thetaT));

  const rs = (n1 * cosI - n2 * cosT) /
             (n1 * cosI + n2 * cosT);

  const rpDenominator = n2 * cosI + n1 * cosT;
  const rp = rpDenominator === 0
    ? 0
    : (n2 * cosI - n1 * cosT) / rpDenominator;

  const reflectance = polarization.value === "p"
    ? rp * rp
    : rs * rs;

  return {
    thetaI,
    thetaT,
    thetaB,
    n2,
    reflectance: Math.max(0, Math.min(1, reflectance))
  };
}

function line(x1, y1, x2, y2, color, width = 3, dash = []) {
  ctx.beginPath();
  ctx.setLineDash(dash);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.setLineDash([]);
}

function arrow(x1, y1, x2, y2, color, width = 3) {
  line(x1, y1, x2, y2, color, width);

  const a = Math.atan2(y2 - y1, x2 - x1);
  const size = 11;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - size * Math.cos(a - Math.PI / 6),
    y2 - size * Math.sin(a - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - size * Math.cos(a + Math.PI / 6),
    y2 - size * Math.sin(a + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function label(text, x, y, color = "#334155", size = 14) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px Arial`;
  ctx.fillText(text, x, y);
}

function draw() {
  const v = currentValues();
  const { thetaI, thetaT, thetaB, n2, reflectance } = v;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = "#fbfdff";
  ctx.fillRect(0, 0, W, H);

  // Glass medium
  const surfaceY = 245;
  const hitX = 410;

  ctx.fillStyle = "#dff3fc";
  ctx.fillRect(35, surfaceY, 730, 185);

  line(35, surfaceY, 765, surfaceY, "#3986a8", 3);

  label(`AIR  (n = ${n1.toFixed(2)})`, 55, 35, "#475569");
  label(`GLASS / MEDIUM  (n = ${n2.toFixed(2)})`,
    55, 275, "#17618a");

  // Normal
  line(hitX, 40, hitX, 430, "#64748b", 1.5, [7, 6]);
  label("Normal", hitX + 9, 57, "#64748b", 12);

  // Incident ray: angle measured from normal.
  const incidentLength = 230;
  const ix = hitX - incidentLength * Math.sin(rad(thetaI));
  const iy = surfaceY - incidentLength * Math.cos(rad(thetaI));

  arrow(ix, iy, hitX, surfaceY, "#ef4444", 4);
  label("Incident ray", Math.max(45, ix - 15), Math.max(70, iy - 15),
    "#b91c1c", 13);

  // Reflected ray: angle of reflection equals incidence.
  const rx = hitX + incidentLength * Math.sin(rad(thetaI));
  const ry = surfaceY - incidentLength * Math.cos(rad(thetaI));

  arrow(hitX, surfaceY, rx, ry, "#f59e0b", 4);
  label("Reflected ray", Math.min(620, rx - 35), Math.max(70, ry - 14),
    "#a16207", 13);

  // Refracted ray in the second medium.
  const refractedLength = 210;
  const tx = hitX + refractedLength * Math.sin(rad(thetaT));
  const ty = surfaceY + refractedLength * Math.cos(rad(thetaT));

  arrow(hitX, surfaceY, tx, ty, "#2563eb", 4);
  label("Refracted ray", Math.min(620, tx - 20), Math.min(415, ty + 25),
    "#1d4ed8", 13);

  // Incident angle arc
  ctx.beginPath();
  ctx.arc(hitX, surfaceY, 48, -Math.PI / 2,
    -Math.PI / 2 - rad(thetaI), true);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2;
  ctx.stroke();
  label("θi", hitX - 43, surfaceY - 56, "#b91c1c", 13);

  // Reflection angle arc
  ctx.beginPath();
  ctx.arc(hitX, surfaceY, 48, -Math.PI / 2,
    -Math.PI / 2 + rad(thetaI), false);
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 2;
  ctx.stroke();
  label("θr", hitX + 32, surfaceY - 56, "#a16207", 13);

  // Brewster angle marker
  const isAtBrewster = Math.abs(thetaI - thetaB) < 1.0;

  label(
    isAtBrewster ? "Near Brewster angle" : `Brewster angle: ${thetaB.toFixed(2)}°`,
    45, 450, isAtBrewster ? "#047857" : "#334155", 13
  );

  // UI values
  angleValue.textContent = `${thetaI}°`;
  brewsterValue.textContent = `${thetaB.toFixed(2)}°`;
  reflectionValue.textContent = `${thetaI.toFixed(1)}°`;
  refractionValue.textContent = `${thetaT.toFixed(2)}°`;
  intensityValue.textContent = `${(reflectance * 100).toFixed(3)}%`;

  if (isAtBrewster && polarization.value === "p") {
    statusBox.textContent =
      "Near Brewster angle: p-polarized reflected intensity is at its minimum.";
  } else if (isAtBrewster) {
    statusBox.textContent =
      "At Brewster angle, s-polarized light is still reflected.";
  } else {
    statusBox.textContent =
      "Change the incidence angle and observe the reflected and refracted rays.";
  }
}

function recordReading() {
  const v = currentValues();

  readings.push({
    incidence: v.thetaI.toFixed(1),
    reflection: v.thetaI.toFixed(1),
    refraction: v.thetaT.toFixed(2),
    brewster: v.thetaB.toFixed(2),
    intensity: (v.reflectance * 100).toFixed(3)
  });

  observationBody.innerHTML = readings.map(r => `
    <tr>
      <td>${r.incidence}</td>
      <td>${r.reflection}</td>
      <td>${r.refraction}</td>
      <td>${r.brewster}</td>
      <td>${r.intensity}</td>
    </tr>
  `).join("");
}

angleSlider.addEventListener("input", draw);
materialSelect.addEventListener("change", draw);
polarization.addEventListener("change", draw);

document.getElementById("recordBtn").addEventListener("click", recordReading);

document.getElementById("resetBtn").addEventListener("click", () => {
  angleSlider.value = 56;
  materialSelect.value = "1.50";
  polarization.value = "p";
  readings = [];
  observationBody.innerHTML =
    '<tr><td colspan="5">No readings recorded yet.</td></tr>';
  draw();
});

draw();
