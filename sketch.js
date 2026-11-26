'use strict';

const stage = document.getElementById('stage');
const cart = document.getElementById('shopping-cart');
const cartIcon = document.getElementById('cart-icon');
const cartBadge = document.getElementById('cart-badge');
const cartStatus = document.getElementById('cart-status');
const productFiles = document.getElementById('product-files');
const productStatus = document.getElementById('product-status');
const projectPanel = document.getElementById('project-info');
const projectTab = document.getElementById('project-tab');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const glyphPalettes = [
  [".,'", ':-=;/', 't+rx7', 'svckz', 'uYJSL', 'VXHAP', 'WQBNM', '@#%&8'],
  [".':", '|/!-', '171+', '1347', '2356$', '6049', '9068#', '@8%&0'],
  ["'.,", ':_-/|', '<>[]', '+=*?', '{}^~', '][($X', '%#8&', '@%#&8']
];
const ink = ['#30485d', '#405c73', '#58768c', '#7694a8', '#96b4c5', '#b2cbd6', '#cfe1e7', '#edf6f8'];
// Axial position, lateral center, and half-width in units of the corresponding bone.
const humerus = [
  [-0.055, -0.049, 0.012], [0.020, -0.046, 0.085], [0.105, -0.028, 0.073],
  [0.24, -0.003, 0.045], [0.46, 0, 0.037], [0.68, 0.009, 0.042],
  [0.82, 0.019, 0.059], [0.94, 0.022, 0.087], [1.010, 0.028, 0.080], [1.064, 0.038, 0.018]
];
const ulna = [
  [-0.058, 0.023, 0.018], [0.013, 0.043, 0.067], [0.095, 0.064, 0.060],
  [0.24, 0.077, 0.041], [0.43, 0.085, 0.030], [0.67, 0.094, 0.024],
  [0.90, 0.100, 0.022], [0.984, 0.102, 0.031], [1.039, 0.103, 0.011]
];
const radius = [
  [-0.022, -0.067, 0.018], [0.038, -0.072, 0.050], [0.127, -0.051, 0.037],
  [0.31, -0.057, 0.030], [0.54, -0.066, 0.030], [0.73, -0.075, 0.040],
  [0.89, -0.078, 0.057], [0.978, -0.080, 0.062], [1.038, -0.087, 0.014]
];
const carpals = [
  [0.041, -0.153, 0.044, 0.039], [0.060, -0.052, 0.049, 0.040],
  [0.067, 0.050, 0.041, 0.037], [0.102, 0.139, 0.035, 0.032],
  [0.151, -0.181, 0.043, 0.038], [0.163, -0.085, 0.042, 0.036],
  [0.172, 0.013, 0.048, 0.039], [0.167, 0.113, 0.044, 0.041]
];

const digits = [
  { name: 'thumb', width: 0.037, flex: [0.24, 0.24], joints: [
    [0.184, -0.245], [0.365, -0.426], [0.514, -0.518], [0.613, -0.556]
  ] },
  { name: 'index', width: 0.032, flex: [0, 0, 0], joints: [
    [0.204, -0.128], [0.537, -0.154], [0.742, -0.168], [0.890, -0.172], [1, -0.163]
  ] },
  { name: 'middle', width: 0.034, flex: [0.52, 0.70, 0.42], joints: [
    [0.210, -0.013], [0.565, -0.019], [0.793, -0.001], [0.954, 0.013], [1.080, 0.030]
  ] },
  { name: 'ring', width: 0.030, flex: [0.65, 0.76, 0.45], joints: [
    [0.206, 0.087], [0.532, 0.116], [0.731, 0.157], [0.878, 0.182], [0.985, 0.208]
  ] },
  { name: 'little', width: 0.027, flex: [0.69, 0.81, 0.46], joints: [
    [0.196, 0.165], [0.460, 0.238], [0.621, 0.297], [0.725, 0.338], [0.823, 0.372]
  ] }
];

const indexTip = digits[1].joints.at(-1);
const handAlignment = -Math.atan2(indexTip[1], indexTip[0]);
const handUnit = Math.hypot(...indexTip);
const maxElbowFlexion = 145 * Math.PI / 180;

// Forearm rotation is measured from supination, using a pivot through the
// proximal radial head and distal ulnar head. Real joint translation is omitted.
const radialHead = [0.035, -0.069];
const ulnarHead = [0.985, 0.101];
const rotationAxisLength = Math.hypot(ulnarHead[0] - radialHead[0], ulnarHead[1] - radialHead[1]);
const rotationAxisX = (ulnarHead[0] - radialHead[0]) / rotationAxisLength;
const rotationAxisY = (ulnarHead[1] - radialHead[1]) / rotationAxisLength;

// Cross-sections guide the fitted product edges in the moving arm's coordinates.
// Each entry is axial position, center offset, and half-width.
const armProfiles = {
  upper: [
    [-0.14, 0.009, 0.153], [0.07, -0.020, 0.153], [0.25, -0.031, 0.164],
    [0.43, -0.039, 0.169], [0.60, -0.020, 0.135], [0.78, 0.003, 0.101],
    [0.93, 0.009, 0.096], [1.065, 0.012, 0.093]
  ],
  forearm: [
    [-0.102, 0.021, 0.100], [0.032, 0.006, 0.126], [0.201, -0.023, 0.165],
    [0.341, -0.025, 0.172], [0.56, -0.014, 0.141], [0.775, 0.003, 0.103],
    [0.937, 0.011, 0.082], [1.072, 0.009, 0.081]
  ],
  palm: [
    [-0.104, -0.019, 0.136], [0.034, -0.010, 0.164], [0.155, -0.019, 0.218],
    [0.306, 0.012, 0.250], [0.410, 0.025, 0.223], [0.507, 0.013, 0.170],
    [0.584, -0.027, 0.100], [0.635, -0.074, 0.018]
  ]
};

// Region, start, end, lengthwise divisions, and rows across the silhouette.
// The same divisions supply the silhouette and the coverage of all 40 windows.
const scanRegions = [
  ['upper', -0.14, 1, 4, 2],
  ['forearm', 0, 1, 6, 2],
  ['palm', 0, 0.625, 2, 2],
  ['index', 0.04, 1, 3, 1],
  ['middle', 0.04, 1, 4, 1],
  ['ring', 0.05, 1, 3, 1],
  ['little', 0.05, 1, 3, 1],
  ['thumb', 0.05, 1, 3, 1]
];
const scanCount = scanRegions.reduce((count, [, , , divisions, rows]) => count + divisions * rows, 0);
const firstWristWindow = scanRegions[0][3] * scanRegions[0][4] + (scanRegions[1][3] - 1) * scanRegions[1][4];

const maxNotifications = 100; // Display the overflow state as 99+.
const surgeThreshold = 20;
const baseNotificationInterval = 3400;
const maxNotificationSpeed = 10;
const surgeInterval = baseNotificationInterval / maxNotificationSpeed;
const notificationClickAdvance = 2400;
const notificationGrowth = 1 / 32_000;
const ageAtMaxSpeed = Math.log(maxNotificationSpeed) / notificationGrowth;
const progressAtMaxSpeed = (maxNotificationSpeed - 1) / (baseNotificationInterval * notificationGrowth);

function notificationProgress(age) {
  const rampTime = Math.min(age, ageAtMaxSpeed);
  // Integrate the exponential speed multiplier, then continue at the capped rate.
  return Math.expm1(notificationGrowth * rampTime) / (baseNotificationInterval * notificationGrowth) +
    (age - rampTime) / surgeInterval;
}

function ageAtNotificationProgress(progress) {
  const rampProgress = Math.min(progress, progressAtMaxSpeed);
  return Math.log1p(rampProgress * baseNotificationInterval * notificationGrowth) / notificationGrowth +
    (progress - rampProgress) * surgeInterval;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(start, end, value) {
  const position = clamp((value - start) / (end - start), 0, 1);
  return position * position * (3 - 2 * position);
}

function viewportRig(width, height) {
  const scale = Math.min(width, height);
  const aspect = width / height;
  const portrait = aspect < 1.10;
  const restingShoulder = {
    x: -scale * (portrait ? 0.084 : 0.047),
    y: -scale * (portrait ? 0.047 : 0.084)
  };
  const reach = Math.hypot(width - restingShoulder.x, height - restingShoulder.y);
  // Scale one set of adult proportions to the viewport once, at full extension.
  const upperLength = reach / (1 + 0.80 + 0.54);
  const forearmLength = upperLength * 0.80;
  const handLength = upperLength * 0.54;
  const elbowSide = portrait ? -1 : 1;
  const landscape = smoothstep(1.10, 1.90, aspect);
  const ultrawide = smoothstep(1.8, 4.5, aspect);
  const rest = {
    x: width * (portrait ? 0.87 : 0.955 - 0.02 * landscape + 0.047 * ultrawide),
    y: height * (portrait ? 0.86 : 0.835 - 0.08 * landscape - 0.44 * ultrawide)
  };
  return { scale, restingShoulder, reach, handLength, upperLength, forearmLength, elbowSide, rest };
}

function forearmRotation(roll) {
  const cosine = Math.cos(roll);
  const sine = Math.sin(roll);
  return ([x, y, z]) => {
    const dx = x - ulnarHead[0];
    const dy = y - ulnarHead[1];
    const along = dx * rotationAxisX + dy * rotationAxisY;
    const across = dy * rotationAxisX - dx * rotationAxisY;
    const rotated = across * cosine - z * sine;
    return [
      ulnarHead[0] + along * rotationAxisX - rotated * rotationAxisY,
      ulnarHead[1] + along * rotationAxisY + rotated * rotationAxisX,
      across * sine + z * cosine
    ];
  };
}

function handInForearm(wristAngle, scale, rotate) {
  const cosine = Math.cos(wristAngle + handAlignment) * scale / handUnit;
  const sine = Math.sin(wristAngle + handAlignment) * scale / handUnit;
  return ([x, y, z]) => rotate([
    1 + x * cosine - y * sine,
    x * sine + y * cosine,
    z * scale / handUnit
  ]);
}

function projectBone(origin, angle, length) {
  const cosine = Math.cos(angle) * length;
  const sine = Math.sin(angle) * length;
  return ([x, y, z]) => [origin.x + x * cosine - y * sine, origin.y + x * sine + y * cosine, z * length];
}

function solvePose(rig, target) {
  const { restingShoulder, reach, handLength, upperLength, forearmLength, elbowSide } = rig;
  const approach = Math.hypot(target.x - restingShoulder.x, target.y - restingShoulder.y) / reach;
  const retreat = (1 - smoothstep(0.06, 0.58, approach)) * reach;
  const shoulder = {
    x: restingShoulder.x - retreat * 0.164,
    y: restingShoulder.y - retreat * 0.134
  };
  const dx = target.x - shoulder.x;
  const dy = target.y - shoulder.y;
  const distance = Math.hypot(dx, dy);
  const targetAngle = Math.atan2(dy, dx);
  const turnRoom = 1 - smoothstep(0.73, 1, distance / reach);
  // Start obliquely so the relaxed fingers curl visibly beneath the index.
  const rollRoom = 1 - smoothstep(0.90, 1, distance / reach);
  const roll = (1.04 + 1.27 * smoothstep(0.78, 1.47, targetAngle)) * rollRoom;
  const wristAngle = elbowSide * 0.185 * turnRoom;
  const rotateRadius = forearmRotation(roll);
  const positionHand = handInForearm(wristAngle, handLength / forearmLength, rotateRadius);
  const [tipX, tipY] = positionHand([...indexTip, 0]);
  const lowerLength = Math.hypot(tipX, tipY) * forearmLength;
  const handOffset = Math.atan2(tipY, tipX);

  // Solve the planar hinge with the posed hand included in the lower link.
  // Clamp the target to the elbow's reachable arc before locating the joints.
  const lengthAt = (bend) => Math.sqrt(upperLength ** 2 + lowerLength ** 2 + 2 * upperLength * lowerLength * Math.cos(bend));
  const offset = elbowSide * handOffset;
  const span = clamp(distance, lengthAt(maxElbowFlexion - offset), Math.min(reach, lengthAt(Math.max(0, -offset))));
  const targetX = shoulder.x + Math.cos(targetAngle) * span;
  const targetY = shoulder.y + Math.sin(targetAngle) * span;
  const shoulderBend = Math.acos(clamp((upperLength ** 2 + span ** 2 - lowerLength ** 2) / (2 * upperLength * span), -1, 1));
  const upperAngle = targetAngle + elbowSide * shoulderBend;
  const elbow = { x: shoulder.x + Math.cos(upperAngle) * upperLength, y: shoulder.y + Math.sin(upperAngle) * upperLength };
  const forearmAngle = Math.atan2(targetY - elbow.y, targetX - elbow.x) - handOffset;
  return { shoulder, elbow, upperAngle, forearmAngle, rotateRadius, positionHand, turnRoom };
}

function followAxis(position, velocity, target, dt, speed = 13) {
  // A critically damped spring settles at the pointer without overshooting it.
  const offset = position - target;
  const step = (velocity + speed * offset) * dt;
  const decay = Math.exp(-speed * dt);
  return [(offset + step) * decay + target, (velocity - speed * step) * decay];
}

function profile(slices) {
  return slices.map(([x, y, radius], index) => {
    const before = slices[Math.max(0, index - 1)];
    const after = slices[Math.min(slices.length - 1, index + 1)];
    const dx = after[0] - before[0];
    const dy = after[1] - before[1];
    const length = Math.hypot(dx, dy) || 1;
    return { x, y, nx: -dy / length * radius, ny: dx / length * radius };
  });
}

function curveThrough(context, points, start) {
  const [first, ...rest] = points;
  if (start) context.moveTo(first[0], first[1]);
  else context.lineTo(first[0], first[1]);

  for (let index = 0; index < rest.length - 1; index++) {
    const [x, y] = rest[index];
    const [nextX, nextY] = rest[index + 1];
    context.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2);
  }
  context.lineTo(...rest.at(-1));
}

function articulateFinger(digit, follow, press) {
  const joints = [[...digit.joints[0], 0]];
  const thumb = digit.name === 'thumb';
  const indexFinger = digit.name === 'index';
  const pressAngles = [0.18, 0.23, 0.17];
  // The thumb opposes from its metacarpal, starting at the saddle joint.
  const opposition = thumb ? 0.73 : 0;
  const turnCosine = Math.cos(opposition);
  const turnSine = Math.sin(opposition);
  let flexion = thumb ? 0.60 + press * 0.042 : 0;
  for (let index = 1; index < digit.joints.length; index++) {
    const [x, y] = digit.joints[index];
    const [previousX, previousY] = digit.joints[index - 1];
    const [jointX, jointY, jointZ] = joints[index - 1];
    const dx = x - previousX;
    const dy = y - previousY;
    if (index > 1) {
      const closing = indexFinger ? pressAngles[index - 2] * press : press * 0.044;
      flexion += clamp(digit.flex[index - 2] + closing + follow * 0.096, -0.073, 1.35);
    }
    // Palmar flexion tilts a rigid link out of the plane of the palm.
    const cosine = Math.cos(flexion);
    joints.push([
      jointX + (dx * turnCosine - dy * turnSine) * cosine,
      jointY + (dx * turnSine + dy * turnCosine) * cosine,
      jointZ - Math.hypot(dx, dy) * Math.sin(flexion)
    ]);
  }
  return joints;
}

function palmSurface(project) {
  const [x, y] = project([0, 0, 0]);
  const [endX, endY] = project([1, 0, 0]);
  const [sideX, sideY] = project([0, 1, 0]);
  const [depthX, depthY] = project([0, 0, 1]);
  const dx = endX - x;
  const dy = endY - y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const width = (sideX - x) * nx + (sideY - y) * ny;
  const depth = (depthX - x) * nx + (depthY - y) * ny;
  const shear = ((sideX - x) * dx + (sideY - y) * dy) / (length * length);
  // A palm shows some thickness even when the bones turn edge-on.
  const cross = Math.hypot(width, depth * 0.37);
  return ([u, v]) => [x + u * dx + v * (nx * cross + dx * shear), y + u * dy + v * (ny * cross + dy * shear)];
}

function projectedBone(sections, project, scale, light) {
  const slices = sections.map(([u, v, width]) => {
    const [x, y] = project([u, v, 0]);
    return [x, y, width * scale];
  });
  return { slices, light };
}

function projectArm(pose, rig, fingerFollow, press) {
  const upper = projectBone(pose.shoulder, pose.upperAngle, rig.upperLength);
  const forearm = projectBone(pose.elbow, pose.forearmAngle, rig.forearmLength);
  const palm = (point) => forearm(pose.positionHand(point));
  const handScale = rig.handLength / handUnit;
  const wristRoll = (pose.rotateRadius([1, -0.073, 0])[1] + 0.073) * 0.47;
  const forearmSurface = ([x, y, z]) => forearm([x, y + x * wristRoll, z]);
  const fingers = digits.map((digit) => ({
    digit,
    joints: articulateFinger(digit, fingerFollow, press).map(palm)
  }));
  const bones = [
    projectedBone(humerus, upper, rig.upperLength, 1),
    projectedBone(ulna, forearm, rig.forearmLength, 0.84),
    projectedBone(radius, (point) => forearm(pose.rotateRadius(point)), rig.forearmLength, 0.99)
  ];
  for (const [u, v, length, width] of carpals) {
    const sections = [[u - length, v, 0.12 * width], [u - length * 0.66, v, width * 0.79],
      [u, v, width], [u + length * 0.64, v, width * 0.85], [u + length, v, 0.16 * width]];
    bones.push(projectedBone(sections, palm, handScale, 0.91));
  }
  for (const { digit, joints } of fingers) {
    for (let index = 1; index < joints.length; index++) {
      const [x, y, depth] = joints[index - 1];
      const [endX, endY, endDepth] = joints[index];
      const width = digit.width * handScale * (0.84 - 0.088 * (index - 1));
      const segments = [[0.043, 0.47], [0.13, 0.93], [0.32, 0.59], [0.66, 0.58], [0.88, 0.91], [0.957, 0.38]];
      const slices = segments.map(([t, swell]) =>
        [x + (endX - x) * t, y + (endY - y) * t, width * swell]
      );
      bones.push({ slices, light: 0.90 - 0.075 * clamp((depth + endDepth) / (2 * handScale), -0.6, 0.6) });
    }
  }
  return { bones, surfaces: { upper, forearm: forearmSurface, palm: palmSurface(palm) }, fingers, handScale };
}

function paintBone(context, bone) {
  const outline = profile(bone.slices);
  const bands = [[-1, 1, 0.49], [-0.80, 0.76, 0.66], [-0.61, 0.49, 0.80], [-0.50, 0.16, 0.95], [-0.41, -0.08, 1]];
  for (const [low, high, value] of bands) {
    const edge = (side) => outline.map(({ x, y, nx, ny }) => [x + side * nx, y + side * ny]);
    context.beginPath();
    curveThrough(context, edge(low), true);
    curveThrough(context, edge(high).reverse(), false);
    context.closePath();
    const level = Math.round(value * bone.light * 255);
    context.fillStyle = 'rgb(' + level + ', ' + level + ', ' + level + ')';
    context.fill();
  }
}

function hashCell(cell, time) {
  let value = Math.imul(cell + 1, 0x45d9f3b) ^ Math.imul(time + 1, 0x27d4eb2d);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return (value ^ (value >>> 16)) >>> 0;
}

function grainAt(cell, seed) {
  return hashCell(cell, seed) / 0x100000000;
}

function growthOrder(seed) {
  const start = firstWristWindow - 6 + Math.floor(10 * grainAt(scanCount, seed));
  const bias = (grainAt(scanCount + 1, seed) - 0.5) * 0.72;
  // Begin near the wrist and favor its neighbors as the outline fills in.
  return Array.from({ length: scanCount }, (_, slot) => {
    const distance = slot - start;
    const rank = Math.abs(distance) + distance * bias + (distance ? grainAt(slot, seed) * 3.2 : 0);
    return { slot, rank };
  }).sort((a, b) => a.rank - b.rank).map(({ slot }) => slot);
}

function armSection(sections, u) {
  const next = sections.findIndex(([x]) => x > u);
  const index = next < 0 ? sections.length - 2 : Math.max(0, next - 1);
  const [x0, y0, width0] = sections[index];
  const [x1, y1, width1] = sections[index + 1];
  const blend = smoothstep(x0, x1, u);
  return [y0 + (y1 - y0) * blend, width0 + (width1 - width0) * blend];
}

function fingerContour({ digit, joints }, scale) {
  const width = digit.width * scale * 1.16;
  const [baseX, baseY] = joints[0];
  const [knuckleX, knuckleY] = joints[1];
  const slices = [
    [baseX + (knuckleX - baseX) * 0.87, baseY + (knuckleY - baseY) * 0.87, width * 0.80],
    [knuckleX, knuckleY, width]
  ];
  for (let index = 2; index < joints.length; index++) {
    const [x, y] = joints[index - 1];
    const [nextX, nextY] = joints[index];
    const size = width * (1 - (index - 2) * 0.12);
    const cuts = index === joints.length - 1
      ? [[0.40, 0.91], [0.70, 0.79], [0.88, 0.64], [1, 0]]
      : [[0.43, 0.84], [1, 0.93]];
    for (const [t, swell] of cuts) {
      slices.push([x + (nextX - x) * t, y + (nextY - y) * t, size * swell]);
    }
  }
  const outline = profile(slices);
  const distances = [0];
  for (let index = 1; index < outline.length; index++) {
    const a = outline[index - 1], b = outline[index];
    distances.push(distances[index - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  return (u, v) => {
    const distance = clamp(u, 0, 1) * distances.at(-1);
    const next = distances.findIndex((value) => value > distance);
    const index = next < 0 ? outline.length - 2 : next - 1;
    const step = distances[index + 1] - distances[index];
    const t = step > 0 ? (distance - distances[index]) / step : 1;
    const a = outline[index], b = outline[index + 1];
    return [
      (a.x + a.nx * v) * (1 - t) + (b.x + b.nx * v) * t,
      (a.y + a.ny * v) * (1 - t) + (b.y + b.ny * v) * t
    ];
  };
}

function poseContours(frame) {
  const contours = {};
  for (const [region, project] of Object.entries(frame.surfaces)) {
    const sections = armProfiles[region];
    contours[region] = (u, v) => {
      const [center, width] = armSection(sections, u);
      return project([u, center + v * width, 0]);
    };
  }
  for (const finger of frame.fingers) {
    contours[finger.digit.name] = fingerContour(finger, frame.handScale);
  }

  // Share edge points on both sides of the elbow and wrist.
  const { upper, forearm, palm, index, little } = contours;
  const elbow = (side) => lerpPoint(upper(1, side), forearm(0, side), 0.5);
  const wrist = (side) => lerpPoint(forearm(1, side), palm(0, side), 0.5);
  contours.upper = (u, side) => u < 0.80 ? upper(u, side)
    : lerpPoint(upper(u, side), elbow(side), smoothstep(0.80, 1, u));
  contours.forearm = (u, side) => {
    if (u < 0.18) return lerpPoint(elbow(side), forearm(u, side), smoothstep(0, 0.18, u));
    if (u > 0.82) return lerpPoint(forearm(u, side), wrist(side), smoothstep(0.82, 1, u));
    return forearm(u, side);
  };
  contours.palm = (u, side) => {
    if (u < 0.17) return lerpPoint(wrist(side), palm(u, side), smoothstep(0, 0.17, u));
    if (u < 0.44) return palm(u, side);
    const knuckles = lerpPoint(index(0.10, -1), little(0.10, 1), (side + 1) / 2);
    return lerpPoint(palm(u, side), knuckles, smoothstep(0.44, 0.625, u));
  };
  return contours;
}

function lerpPoint([ax, ay], [bx, by], amount) {
  return [ax + (bx - ax) * amount, ay + (by - ay) * amount];
}

function collageLayout(contours) {
  const windows = [];
  const stepsPerWindow = 6;

  for (const [region, start, end, divisions, rows] of scanRegions) {
    const point = contours[region];
    const steps = divisions * stepsPerWindow;
    const edges = Array.from({ length: rows + 1 }, (_, row) => {
      const side = -1 + 2 * row / rows;
      return Array.from({ length: steps + 1 }, (_, step) => point(start + (end - start) * step / steps, side));
    });

    for (let division = 0; division < divisions; division++) {
      const first = division * stepsPerWindow;
      const last = first + stepsPerWindow;
      for (let row = 0; row < rows; row++) {
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        for (let step = first; step <= last; step++) {
          const [ax, ay] = edges[row][step];
          const [bx, by] = edges[row + 1][step];
          left = Math.min(left, ax, bx);
          top = Math.min(top, ay, by);
          right = Math.max(right, ax, bx);
          bottom = Math.max(bottom, ay, by);
        }
        const broad = rows > 1;
        const outerRow = broad ? row * rows : (region === 'thumb' || region === 'little' ? rows : 0);
        const middle = (first + last) / 2;
        const edge = edges[outerRow];
        const [edgeX, edgeY] = edge[middle];
        const [startX, startY] = edge[first];
        const [endX, endY] = edge[last];
        const dx = endX - startX;
        const dy = endY - startY;
        const span = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const u = start + (end - start) * middle / steps;
        const [coreX, coreY] = point(u, 0);
        const [glyphX, glyphY] = region === 'forearm' ? point(u, row === 0 ? -0.43 : 0.43) : [coreX, coreY];
        const across = -Math.sin(angle) * (edgeX - coreX) + Math.cos(angle) * (edgeY - coreY);
        const side = across < 0 ? -1 : 1;
        const bow = dx * (edgeY - (startY + endY) / 2) - dy * (edgeX - (startX + endX) / 2);
        windows.push({
          left, top, right, bottom, broad, edgeX, edgeY, glyphX, glyphY,
          angle, span, bend: Math.abs(bow) / Math.max(1, span * span),
          outwardX: -Math.sin(angle) * side,
          outwardY: Math.cos(angle) * side,
          depth: Math.max(1.5, 2 * Math.abs(across))
        });
      }
    }
  }
  return windows;
}

function scanWindow(bounds, { product, order, at, seed }, milliseconds, animate) {
  const stepTime = 42 + 53 * grainAt(1, seed);
  const clock = milliseconds - at + grainAt(2, seed) * 2100;
  const step = animate ? Math.floor(clock / stepTime) : 0;
  const shuffle = animate ? Math.floor(clock / (180 + 200 * grainAt(3, seed))) : 0;
  const fresh = milliseconds - at < 620;
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const padding = bounds.broad ? clamp((width + height) * 0.032, 3.2, 8) : clamp((width + height) * 0.025, 0.9, 2.4);
  const jump = animate && grainAt(step + 43, seed) > 0.84 ? padding * (1.6 + 1.9 * grainAt(step + 37, seed)) : 0;
  const driftX = animate ? (grainAt(step + 21, seed) - 0.5) * padding * 1.1 + bounds.outwardX * jump : 0;
  const driftY = animate ? (grainAt(step + 31, seed) - 0.5) * padding * 1.1 + bounds.outwardY * jump : 0;
  const window = {
    x: bounds.left - padding + driftX,
    y: bounds.top - padding + driftY,
    width: width + 2 * padding,
    height: height + 2 * padding,
    edgeX: bounds.edgeX + driftX,
    edgeY: bounds.edgeY + driftY,
    glyphX: bounds.glyphX,
    glyphY: bounds.glyphY,
    broad: bounds.broad,
    depth: bounds.depth,
    outwardX: bounds.outwardX,
    outwardY: bounds.outwardY,
    sideways: Math.abs(Math.cos(bounds.angle)) >= Math.SQRT1_2,
    span: bounds.span,
    image: product.image, order, step, seed, fresh,
    flicker: animate && (jump > 0 || grainAt(step + 112, seed) > (fresh ? 0.52 : 0.88))
  };

  let bestScore = -Infinity;
  for (const [index, crease] of product.creases.entries()) {
    const tilt = bounds.angle - crease.angle;
    const turn = tilt - Math.round(tilt / Math.PI) * Math.PI;
    const cover = photoScale(window, crease, turn);
    const magnification = cover * crease.length / Math.max(1, window.span);
    const variation = grainAt((fresh ? 0 : shuffle) * product.creases.length + index, seed);
    const score = crease.score - 0.90 * Math.abs(bounds.bend - crease.bend) -
      0.055 * Math.log2(Math.max(1, magnification)) + 0.07 * variation;
    if (score <= bestScore) continue;
    bestScore = score;
    window.crease = crease;
    window.turn = turn;
    window.zoom = cover * (1 + 0.07 * grainAt(step + 113, seed));
  }
  return window;
}

function photoScale({ x, y, width, height, edgeX, edgeY, image, span }, crease, turn) {
  const cosine = Math.cos(turn);
  const sine = Math.sin(turn);
  const dx = x + width / 2 - edgeX;
  const dy = y + height / 2 - edgeY;
  // Measure the whole box in the photo's coordinates so the rotated image covers every corner.
  const centerX = dx * cosine + dy * sine;
  const centerY = dy * cosine - dx * sine;
  const radiusX = (width * Math.abs(cosine) + height * Math.abs(sine)) / 2;
  const radiusY = (width * Math.abs(sine) + height * Math.abs(cosine)) / 2;
  return Math.max(
    (radiusX - centerX) / crease.x,
    (radiusX + centerX) / (image.width - crease.x),
    (radiusY - centerY) / crease.y,
    (radiusY + centerY) / (image.height - crease.y),
    span / crease.length
  );
}

function drawPhoto(context, { image, crease, turn, zoom, edgeX, edgeY }, offset) {
  context.save();
  context.translate(edgeX + offset, edgeY);
  context.rotate(turn);
  context.scale(zoom, zoom);
  context.drawImage(image, -crease.x, -crease.y);
  context.restore();
}

function shadePhotoEdges(context, { x, y, width, height, broad, depth, edgeX, edgeY, outwardX, outwardY }) {
  const feather = broad ? clamp(Math.min(width, height) * 0.15, 3.5, 10) : clamp(depth * 0.42, 1.3, 4.7);
  const inward = broad ? feather : depth + feather;
  const gradient = context.createLinearGradient(
    edgeX - outwardX * inward, edgeY - outwardY * inward,
    edgeX + outwardX * feather, edgeY + outwardY * feather
  );
  const clear = 'rgba(7, 7, 7, 0)';
  const shadow = broad ? 'rgba(7, 7, 7, 0.68)' : 'rgba(7, 7, 7, 0.81)';
  gradient.addColorStop(0, broad ? clear : shadow);
  if (!broad) gradient.addColorStop(feather / (inward + feather), clear);
  gradient.addColorStop(inward / (inward + feather), clear);
  gradient.addColorStop(1, shadow);
  context.fillStyle = gradient;
  context.fillRect(x, y, width, height);
}

function drawScanWindow(context, window) {
  const { x, y, width, height, broad, step, seed, flicker, fresh } = window;
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.fillStyle = '#242424';
  context.fillRect(x, y, width, height);
  drawPhoto(context, window, 0);

  if (flicker) {
    const band = height * (0.12 + grainAt(step + 17, seed) * 0.68);
    const bandHeight = Math.min(height - band, Math.max(2, height * (0.07 + grainAt(step + 23, seed) * 0.11)));
    const offset = (grainAt(step + 36, seed) - 0.5) * Math.min(42, width * 0.36);
    context.save();
    context.beginPath();
    context.rect(x, y + band, width, bandHeight);
    context.clip();
    drawPhoto(context, window, offset);
    context.restore();
    context.fillStyle = 'rgba(189, 189, 189, 0.36)';
    context.fillRect(x, y + band, width, 1);
  }
  // Shade the photo outside its matched fold so the upright box stays filled.
  shadePhotoEdges(context, window);
  context.restore();
  const opacity = fresh ? 0.81 : (broad ? 0.23 : 0.14) + grainAt(step + 29, seed) * 0.15;
  context.lineWidth = 1;
  context.strokeStyle = 'rgba(204, 204, 204, ' + opacity + ')';
  context.strokeRect(x, y, width, height);
}

function activeWindows(contours, purchases, milliseconds, animate, width, height) {
  const windows = collageLayout(contours).flatMap((bounds, slot) => {
    const purchase = purchases[slot];
    if (!purchase) return [];
    const window = scanWindow(bounds, purchase, milliseconds, animate);
    const { x, y, width: w, height: h } = window;
    return x + w > 0 && y + h > 0 && x < width && y < height ? [window] : [];
  }).sort((a, b) => a.order - b.order);
  if (animate && windows.length >= 16) revealSkeleton(windows, milliseconds, width, height);
  return windows;
}

function revealSkeleton(windows, milliseconds, stageWidth, stageHeight) {
  const tick = Math.floor(milliseconds / 82);
  if (tick % 2 === 0) return;
  const candidates = windows.filter(({ broad, glyphX, glyphY }) =>
    broad && glyphX > 46 && glyphX < stageWidth - 46 && glyphY > 40 && glyphY < stageHeight - 40
  );
  if (!candidates.length) return;

  const index = Math.floor(grainAt(tick, windows[0].seed) * candidates.length);
  const center = candidates[index];
  const length = clamp(center.span * 0.8, 41, 95);
  const depth = clamp(Math.min(center.width, center.height) * 0.32, 17, 32);
  const gapWidth = center.sideways ? length : depth;
  const gapHeight = center.sideways ? depth : length;
  const left = center.glyphX - gapWidth / 2;
  const right = left + gapWidth;
  const top = center.glyphY - gapHeight / 2;
  const bottom = top + gapHeight;

  for (const window of windows) {
    const { x, y, width, height } = window;
    if (x >= right || x + width <= left || y >= bottom || y + height <= top) continue;

    // Jump the whole box away from the scan gap, keeping its photo and connection together.
    const before = center.sideways ? top - y - height : left - x - width;
    const after = center.sideways ? bottom - y : right - x;
    const canMoveBefore = center.sideways ? top > 10 : left > 10;
    const canMoveAfter = center.sideways ? bottom < stageHeight - 10 : right < stageWidth - 10;
    const offset = canMoveBefore && (!canMoveAfter || -before < after) ? before : after;
    if (center.sideways) {
      window.y += offset;
      window.edgeY += offset;
    } else {
      window.x += offset;
      window.edgeX += offset;
    }
  }
}

function drawConnections(context, windows, cart, stageHeight) {
  const opacity = clamp(0.52 - windows.length * 0.009, 0.18, 0.48);
  for (const { x, y, width, height, order, seed, fresh } of windows) {
    const dx = x + width / 2 - cart.x;
    const dy = y + height / 2 - cart.y;
    const toEdge = 1 - Math.min(1, width / (2 * Math.abs(dx)), height / (2 * Math.abs(dy)));
    const endX = dx * toEdge;
    const endY = dy * toEdge;
    const distance = Math.hypot(endX, endY);
    if (distance < 2) continue;
    const direction = order % 2 ? 1 : -1;
    const bend = direction * Math.min(300, distance * (0.18 + grainAt(127, seed) * 0.46));
    const firstX = cart.x + endX * (0.09 + 0.29 * grainAt(67, seed));
    const firstY = clamp(cart.y + endY * 0.17 + bend, 2, stageHeight - 2);
    const secondX = cart.x + endX * (0.64 + 0.28 * grainAt(97, seed));
    const secondY = clamp(cart.y + endY * 0.79 + bend * (grainAt(158, seed) * 1.56 - 0.49), 2, stageHeight - 2);
    context.lineWidth = fresh ? 1.18 : 0.83;
    context.strokeStyle = 'rgba(153, 205, 238, ' + (fresh ? 0.79 : opacity) + ')';
    context.beginPath();
    context.moveTo(cart.x, cart.y);
    context.bezierCurveTo(firstX, firstY, secondX, secondY, cart.x + endX, cart.y + endY);
    context.stroke();
  }
}

const screenFracture = (() => {
  const turn = Math.PI * 2;
  const rings = [
    [0.036, 1, 1], [0.085, 1, 1], [0.150, 1, 1], [0.229, 2, 7],
    [0.318, 4, 12], [0.431, 8, 20], [0.567, 14, 29], [0.700, 22, 39], [0.825, 30, 52]
  ];
  const lastFracture = 100;
  const textureSpan = 2.38;
  const maxTextureSide = 2560;
  const palettes = [
    { // Iridescent sky
      family: 'pink', patterns: ['stars', 'lotus'],
      field: ['#452450', '#99509c', '#da61aa', '#f69ec1', '#ffc2aa'],
      glow: ['#fff1ca', '#fca1d5'],
      uiInk: '#122840', uiInlay: '#bded9a'
    },
    { // Scarlet poster with silver shapes
      family: 'red', patterns: ['stars', 'checkers'],
      field: ['#650c1c', '#a70e1b', '#d91c22', '#ef412b', '#ff8c62'],
      glow: ['#ffe3b2', '#ff9272'],
      uiInk: '#120e1a', uiInlay: '#e8cebf'
    },
    { // Charcoal and copper light
      family: 'red', patterns: ['stars', 'checkers'],
      field: ['#171421', '#44303c', '#a44752', '#df8275', '#f9b191'],
      glow: ['#ffe9d5', '#f4aaa0'],
      uiInk: '#100f1c', uiInlay: '#ed906c'
    },
    { // Vermilion and black ink
      family: 'red', patterns: ['checkers'],
      field: ['#4c0b24', '#a60d2a', '#cf1832', '#ed4a46', '#fb946d'],
      glow: ['#ffd9bd', '#fa8f86'],
      uiInk: '#0a1018', uiInlay: '#eadecd'
    },
    { // Orange and straw yellow
      family: 'orange', patterns: ['lotus', 'checkers'],
      field: ['#8f2521', '#dc4723', '#fb742d', '#ffb168', '#ffe6a3'],
      glow: ['#fff3c6', '#ffd491'],
      uiInk: '#1e263c', uiInlay: '#d6e69a'
    },
    { // Porcelain pink
      family: 'pink', patterns: ['lotus'],
      field: ['#764366', '#c378a8', '#e197c0', '#f7c8d9', '#fce7ec'],
      glow: ['#fff1df', '#fcc5d4'],
      uiInk: '#26334e', uiInlay: '#d0e9b7'
    },
    { // Rose halo
      family: 'pink', patterns: ['lotus', 'stars'],
      field: ['#7c163a', '#d81c46', '#f63d72', '#fd8aaa', '#ffb08b'],
      glow: ['#ffe7c8', '#ff9b9c'],
      uiInk: '#080d21', uiInlay: '#d5ed77'
    },
    { // Acid green
      family: 'green', patterns: ['lotus', 'checkers'],
      field: ['#244938', '#6aab43', '#a6d841', '#d8ed7d', '#f4efad'],
      glow: ['#fcf8ce', '#edf4ac'],
      uiInk: '#0a182a', uiInlay: '#ffb077'
    },
    { // Carmine
      family: 'red', patterns: ['lotus', 'stars'],
      field: ['#5d1e4b', '#af285e', '#e83c62', '#fa7184', '#ffb8a7'],
      glow: ['#fff1c8', '#ffad9d'],
      uiInk: '#171533', uiInlay: '#cce583'
    }
  ];
  // Outlined artwork for the vertical inscription 为物所困.
  // Ma Shan Zheng Project Authors, 2018. https://github.com/google/fonts/tree/main/ofl/mashanzheng
  const inscription = [
    { // 为
      bounds: [16.8, -79.4, 66.477, 88.2],
      outline: `
        M 47.4,-33.7 C 48.2,-34.2 48.9,-34.4 49.5,-34.5 50,-34.6 51.2,-34.6 52.9,-34.5 55.5,-34.3 57.4,-33.8
        58.6,-33.1 59.8,-32.4 60.7,-31.1 61.2,-29.3 61.5,-28.2 61.5,-27.1 61.3,-26 60.9,-24.8 60.4,-23.9
        59.5,-23.2 58.5,-22.5 57.3,-22.3 56,-22.7 54.8,-23.1 52.8,-24.3 50.3,-26.2 47.5,-28.3 45.9,-29.9
        45.5,-30.8 45.1,-31.7 45.7,-32.7 47.4,-33.7 z M 26.2,-61 C 26.7,-61.4 27.2,-61.6 27.6,-61.6 28.1,-61.6
        29.4,-61.5 31.6,-61.2 33.7,-60.9 35.1,-60.4 35.7,-60 36.2,-59.4 36.6,-58.3 36.8,-56.6 36.9,-55.2
        36.9,-54.1 36.7,-53.4 36.5,-52.6 36,-51.9 35.2,-51.3 33.7,-50 32.3,-49.6 31.3,-50.1 30.1,-50.6 28.8,-52
        27.2,-54.5 25.9,-56.5 25.3,-57.9 25.1,-58.7 25,-59.5 25.4,-60.3 26.2,-61 z M 53.1,-75.7 C 53.1,-76.1
        53.3,-76.7 53.6,-77.6 53.9,-78.4 54.3,-78.9 54.6,-79.1 54.9,-79.3 55.6,-79.4 56.5,-79.4 57.2,-79.4
        57.8,-79.3 58.3,-79 58.7,-78.7 59.4,-78.1 60.4,-77.1 62,-75.6 62.9,-74.5 63,-73.7 63.2,-73.1 63.2,-72.2
        63.1,-70.8 63,-69.5 62.8,-68.6 62.5,-68.1 62.2,-67.6 61.5,-66.3 60.6,-64 59.2,-60.4 58,-57.8 57,-56.2
        56.4,-55.2 56,-54.2 55.9,-53.1 L 55.5,-51.5 57.1,-51.7 C 58.9,-52 63.5,-51.7 70.8,-50.7 73.2,-50.4
        75.4,-49.6 77.3,-48.5 79.3,-47.5 80.4,-46.9 80.5,-46.9 81.2,-46.8 82,-45.2 82.9,-42 83.4,-39.9 83.4,-38.5
        83,-37.6 82.1,-35.5 81.3,-32.6 80.6,-29 80.4,-27.3 80.1,-25.5 79.6,-23.6 79.1,-21.8 78.6,-20 78.2,-18.2
        77.5,-14.7 77,-12.8 76.7,-12.5 76.5,-12.2 76.1,-11.2 75.6,-9.6 74.2,-5.7 73.3,-3.8 73,-3.8 72.7,-3.8
        72.3,-3.2 71.7,-2 71.2,-0.8 70,0.7 68.2,2.5 66.4,4.2 64.9,5.4 63.7,5.9 62.6,6.5 62,6.9 62,7.1 62,7.4
        61.1,7.8 59.4,8.2 57.7,8.6 56.1,8.8 54.6,8.8 53.3,8.8 52.5,8.8 52.3,8.7 51.9,8.6 51.7,8.3 51.6,7.8
        51.4,7.1 51.5,6.3 51.9,5.3 52.2,4.2 52.1,3.3 51.8,2.5 51.4,1.8 50.4,0.6 48.7,-0.9 44.3,-5 42.2,-7.3
        42.3,-7.8 42.6,-8.7 43.7,-8.7 45.6,-7.6 46.8,-7 49.2,-6.7 52.7,-6.7 56.2,-6.6 57.9,-6.8 58,-7.2 58.2,-7.5
        58.4,-7.7 58.8,-7.7 59.2,-7.7 60,-8.3 61.2,-9.6 62.3,-10.8 63.1,-11.9 63.5,-12.8 64.8,-15.5 66.2,-19.7
        67.7,-25.4 68.2,-27.2 68.6,-28.7 69,-30 69.3,-31.3 69.5,-32.3 69.5,-33 69.5,-33.7 69.7,-34.6 70.1,-35.9
        70.5,-37.2 70.9,-38.6 71.2,-40.1 71.5,-41.1 71.6,-41.8 71.6,-42.1 71.6,-42.4 71.4,-42.8 71,-43.2
        70.2,-44.1 67.2,-44.7 62,-45 59.3,-45.2 56.9,-45 54.7,-44.3 L 51.4,-43.3 49.7,-40.4 C 48.6,-38.5
        47.6,-37.1 46.8,-36 45.9,-34.9 45.5,-34.1 45.5,-33.5 45.5,-32.9 45.3,-32.5 45,-32.4 44.8,-32.2 44.5,-31.8
        44.2,-31.2 43.9,-30.6 43.1,-29.2 41.8,-27.1 40.4,-25 39.6,-23.6 39.3,-23.1 39,-22.5 38.5,-21.8 37.8,-21.1
        37,-20.5 36.6,-20 36.6,-19.8 36.6,-19.6 36.1,-18.8 35,-17.4 33.9,-15.9 32.9,-14.6 31.8,-13.5 30.6,-12.2
        29.9,-11.3 29.7,-10.8 29.5,-10 28.4,-8.8 26.6,-7.1 24.6,-5.3 23,-4.2 21.7,-3.5 20.9,-3 20.1,-2.7
        19.4,-2.5 18.6,-2.2 18,-2.1 17.5,-2.1 17,-2.1 16.8,-2.3 16.8,-2.6 16.8,-3 17.3,-3.9 18.4,-5.3 19.4,-6.8
        20.5,-8.1 21.8,-9.3 24.5,-12.1 27,-15.8 29.3,-20.4 30.4,-22.4 31,-23.5 31.2,-23.6 31.4,-23.8 32,-24.9
        32.9,-26.8 33.8,-28.7 34.5,-29.8 34.8,-30.1 35.1,-30.4 35.3,-30.8 35.3,-31.3 35.3,-31.8 35.5,-32.3
        36,-32.6 36.4,-32.9 36.6,-33.2 36.6,-33.5 36.6,-33.7 37.1,-34.9 38.2,-37 39.2,-39.1 39.7,-40.3 39.6,-40.4
        39.3,-40.6 38.3,-40.3 36.4,-39.5 34.5,-38.7 32.9,-37.9 31.7,-37.1 L 29,-35.4 26.1,-36.3 C 23.9,-37
        22.5,-37.8 22,-38.5 21.5,-39.2 21.6,-40.1 22.3,-41.3 22.8,-42.2 24.3,-43.2 26.6,-44.3 28.9,-45.3
        33.1,-46.8 39.1,-48.9 41.2,-49.6 42.6,-50.2 43.2,-50.5 43.7,-50.8 44.1,-51.2 44.2,-51.8 44.6,-52.9
        45.5,-55.2 46.8,-58.8 47.5,-60.3 47.9,-61.6 48.1,-62.5 48.3,-63.5 48.7,-64.8 49.3,-66.3 49.9,-67.9
        50.3,-69.1 50.6,-69.8 50.9,-70.4 51.3,-71.5 52,-72.9 52.8,-74.3 53.1,-75.2 53.1,-75.7 z
      `
    },
    { // 物
      bounds: [10.44, -75.537, 84.645, 86.137],
      outline: `
        M 68.1,-33.5 C 68.7,-34.2 69.2,-34.4 69.6,-34.2 70,-34 70.7,-33.3 71.8,-32.2 72.7,-31.1 73.1,-30.2
        73.2,-29.6 73.2,-28.9 72.8,-28 72,-26.7 71.3,-25.4 70.9,-24.7 70.9,-24.6 70.9,-24.4 70.5,-23.9 69.7,-23.1
        68.9,-22.2 67.7,-20.9 66.2,-19 62.6,-14.7 58.1,-10.8 52.8,-7.3 49.5,-5 47.7,-3.9 47.4,-3.9 47.1,-3.9
        46.1,-3.5 44.5,-2.6 41.8,-1.1 40.5,-0.9 40.5,-1.8 40.5,-2.1 40.6,-2.3 41,-2.3 41.3,-2.3 41.4,-2.6
        41.4,-3.1 41.4,-3.6 42.7,-5 45.2,-7.2 47.7,-9.3 50.4,-11.9 53.5,-15 56.7,-18.1 58.8,-20.4 59.9,-21.9
        61.1,-23.4 62.6,-25.5 64.4,-28.3 66.2,-31.1 67.4,-32.8 68.1,-33.5 z M 58.4,-39.7 C 58.4,-40.1 58.6,-40.4
        59,-40.5 59.5,-40.6 59.9,-40.8 60.3,-41 60.7,-41.3 61,-41.4 61.1,-41.4 61.7,-41.4 62.7,-40.7 64.2,-39.4
        65.6,-38 66.3,-37 66.3,-36.5 66.3,-35.8 65.7,-34.8 64.6,-33.5 63.4,-32.2 62,-31 60.5,-30.1 59,-29.1
        57.6,-28 56.4,-27 55.2,-25.9 53.9,-24.9 52.6,-24.2 51.3,-23.5 50,-22.6 48.8,-21.6 47.5,-20.6 46.8,-20.1
        46.5,-20.1 46.1,-20.1 45.7,-19.9 45.2,-19.6 44.1,-18.7 43.4,-18.4 42.9,-18.6 42.9,-18.9 43,-19.1
        43.3,-19.3 43.5,-19.4 43.6,-19.7 43.6,-20 43.6,-20.7 45.2,-22.8 48.5,-26.1 50.4,-28.2 52.6,-30.8 54.9,-34
        57.2,-37.3 58.4,-39.2 58.4,-39.7 z M 65.1,-48.6 C 67.5,-49.2 70.8,-49.4 75,-49.1 79.2,-48.8 82.7,-48.3
        85.5,-47.4 87.1,-47 88,-46.8 88.3,-46.8 88.8,-46.8 89.8,-46.1 91.3,-44.7 92.9,-43.2 93.9,-42.1 94.3,-41.4
        94.7,-40.7 94.9,-39.8 95.1,-38.8 95.2,-37.8 95,-37.2 94.7,-37 94.4,-36.9 94.3,-36.4 94.3,-35.7 94.3,-35
        94.2,-34.3 93.9,-33.7 93.1,-32.3 92.6,-29.1 92.5,-24.1 92.5,-23.8 92.3,-23.4 92,-23.1 91.6,-22.8
        91.3,-21.7 91.1,-20 90.9,-18.3 90.6,-17.1 90.3,-16.6 90,-16.1 89.8,-15.6 89.8,-15.3 89.8,-15 89.1,-13.1
        87.7,-9.6 86.2,-6.1 85.1,-3.5 84.2,-1.7 83.7,-0.6 82.7,0.6 81.4,2 80.1,3.4 78.9,4.3 77.9,4.8 77,5.4
        76.3,6 75.9,6.6 75.1,7.9 73.2,9.1 70.1,10.1 69.1,10.4 68.5,10.6 68.2,10.6 67.9,10.6 67.7,10.4 67.4,10
        66.9,9.5 66.7,9.1 66.7,8.6 66.7,8.1 66.5,7.8 66.2,7.5 65.8,7.2 65.6,6.6 65.6,5.9 65.6,5 65,3.8 63.8,2.2
        62.6,0.5 61.2,-1 59.5,-2.3 58.4,-3.2 57.5,-4.1 56.9,-5 56.1,-5.9 55.9,-6.5 56.2,-6.8 56.4,-7 56.8,-6.8
        57.3,-6.3 57.8,-5.7 58.2,-5.4 58.6,-5.4 59,-5.4 59.5,-5.1 60.1,-4.6 60.7,-4.1 62.1,-3.6 64.2,-3.3 66.3,-3
        67.9,-2.9 68.9,-3.1 69.8,-3.3 70.8,-4 71.9,-5.2 73,-6.4 74,-7.7 74.9,-9 75.6,-10.1 76.6,-12.2 78,-15.3
        79.3,-18.3 80,-20 80,-20.4 80,-20.8 80.2,-21.4 80.5,-22.2 80.8,-23 81.1,-24.1 81.5,-25.5 81.8,-26.9
        82.1,-28.1 82.4,-29.2 83.2,-31.9 83.8,-34.6 84.1,-37.2 84.4,-39.8 84.4,-41.4 83.9,-41.9 83.8,-42.2
        82.8,-42.6 80.8,-42.9 78.9,-43.2 77.5,-43.3 76.6,-43.1 75.9,-43 74.5,-42.8 72.3,-42.7 70.2,-42.6
        68.5,-42.5 67.3,-42.4 66.2,-42.3 65.4,-42.4 65.2,-42.7 64.9,-43 64.5,-43.2 64.2,-43.2 63.9,-43.2
        63.5,-43.5 63.1,-44 62.7,-44.6 62.5,-45.1 62.5,-45.6 62.4,-46.7 62.5,-47.4 62.7,-47.8 62.9,-48 63.7,-48.3
        65.1,-48.6 z M 21.9,-58.8 L 23.7,-62.4 24.8,-62 C 25.5,-61.8 26.2,-61.3 27,-60.6 27.7,-59.9 28.2,-59.2
        28.4,-58.6 28.7,-57.9 28.7,-57 28.5,-55.9 28.3,-54.8 28,-54.1 27.8,-54 27.4,-53.9 27.3,-53.5 27.3,-52.9
        27.3,-52.6 26.8,-51.8 25.8,-50.5 24.7,-49.3 23.7,-48.3 22.6,-47.5 20.9,-46.1 18.8,-44.3 16.3,-42.2
        15.8,-41.7 14.9,-41 13.8,-40.3 12.7,-39.6 11.9,-39.1 11.4,-39 11,-38.9 10.7,-39 10.5,-39.4 10.3,-39.9
        10.6,-40.8 11.4,-42.3 12.2,-43.8 13,-44.9 13.7,-45.7 14.2,-46.2 14.8,-47 15.4,-48.2 16.1,-49.3 16.9,-50.5
        17.8,-51.8 18.9,-53.3 20.2,-55.7 21.9,-58.8 z M 35.3,-60.5 C 35.3,-62.2 35.5,-64.6 36,-67.8 36.5,-70.9
        36.8,-72.8 37,-73.3 37.3,-73.8 37.5,-74.3 37.7,-74.8 37.8,-75.3 38,-75.5 38.1,-75.5 38.3,-75.5 39,-75.1
        40,-74.3 41.2,-73.4 41.7,-72.9 41.7,-72.8 41.7,-72.6 42.1,-72 43,-71.1 44.4,-69.5 44.7,-67.9 43.8,-66.4
        43.4,-65.7 43.2,-65 43.2,-64.3 43.1,-63.6 42.9,-62.5 42.6,-61 42.2,-59.7 42.1,-58.8 42.4,-58.3 42.6,-57.8
        43.1,-57.6 43.9,-57.6 44.9,-57.6 46,-57.1 47.2,-56.3 48.3,-55.3 48.9,-54.5 48.9,-53.6 49,-52.1 48.8,-51.1
        48.2,-50.7 46.7,-49.8 44.9,-49.1 43,-48.6 42.4,-48.5 42,-48.3 42,-48 41.8,-47.6 41.7,-46.7 41.5,-45
        41.4,-42.8 41.4,-41.6 41.5,-41.5 41.7,-41.3 42.2,-41.5 43.2,-42 44.1,-42.5 44.9,-43.1 45.6,-43.8
        46.5,-44.6 47.5,-45.7 48.6,-47.2 L 54.6,-55.5 C 57.6,-59.5 59.1,-61.6 59.1,-61.9 59.1,-62.1 59.5,-62.5
        60.2,-63.2 60.9,-63.9 61.3,-64.3 61.4,-64.6 61.4,-64.9 61.8,-65.4 62.5,-66.2 63.2,-66.9 63.6,-67.4
        63.6,-67.7 63.6,-68 63.8,-68.3 64.1,-68.6 64.4,-68.7 64.9,-69.5 65.8,-70.8 66.7,-72.1 67.3,-73.2
        67.8,-73.9 68.1,-74.4 68,-74.7 67.7,-74.7 67.3,-74.7 67.1,-74.9 67.1,-75.2 67.1,-75.7 67.5,-75.6
        68.2,-74.9 68.3,-74.8 68.4,-74.6 68.6,-74.5 69,-73.9 69.5,-73.5 70.2,-73.2 72.1,-72.3 73.3,-71.6
        73.6,-70.9 74.1,-70.2 74.4,-69.4 74.5,-68.3 74.6,-67.3 74.6,-66.7 74.3,-66.5 74,-66.4 73.8,-66.2
        73.8,-65.7 73.8,-65.2 73,-64.2 71.5,-62.6 L 67.8,-58.6 C 66.9,-57.7,65,-55.8,62,-52.9 L 54.9,-46.3 C
        53,-44.6 51.6,-43.4 50.8,-42.8 49.9,-42.2 49.2,-41.5 48.5,-40.8 47.8,-40 46.8,-39.3 45.4,-38.6 42.8,-37.3
        41.2,-35.5 40.6,-33.2 40.3,-32 40.2,-27.8 40.1,-20.6 40.1,-7.9 39.4,-0.5 38.1,1.6 37.4,2.5 37.1,3
        37.1,3.2 37.1,3.3 36.8,3.7 36.1,4.3 35.4,4.8 35,5.1 34.8,5.2 34.6,5.2 34.1,5.5 33.2,6.2 32.3,6.8 31.8,7.1
        31.6,7.1 31.3,7.1 30.9,6.8 30.3,6.2 29.6,5.5 29.2,5 29.1,4.6 29,4.1 28.4,3.6 27.5,3 26.5,2.3 25.4,1.3
        24.2,-0.1 23,-1.5 22.4,-2.5 22.4,-3 22.4,-3.6 22.6,-3.9 23.1,-4 23.6,-4 24.7,-3.8 26.4,-3.3 27.9,-3
        28.9,-2.8 29.3,-2.8 29.7,-2.8 30.1,-3.2 30.5,-4 30.9,-4.8 31.1,-5.6 31.1,-6.5 31.1,-7.4 31.3,-8.6
        31.7,-10.1 32.1,-11.6 32.3,-13.6 32.3,-16 32.3,-18.4 32.4,-20.4 32.6,-21.9 32.9,-23.6 32.9,-24.4
        32.5,-24.3 32.4,-24.2 32.3,-24.1 32.2,-23.8 31.6,-22.8 30.1,-21.4 27.8,-19.5 25.1,-17.4 22.9,-15.4
        21,-13.5 19.4,-11.9 18.3,-11.1 17.8,-11.1 17.5,-11.1 16.4,-11.5 14.6,-12.4 12.7,-13.2 11.7,-13.8
        11.5,-14.1 11.4,-14.4 11.4,-14.9 11.7,-15.6 12,-16.2 12.4,-16.6 12.9,-16.9 13.7,-17.4 14.1,-17.8
        14.2,-18.1 14.2,-18.4 15.2,-19.3 17.1,-21 L 22.6,-25.5 C 23.1,-25.8 23.8,-26.4 24.9,-27.1 25.9,-27.9
        26.5,-28.4 26.8,-28.7 27.3,-29.2 28.9,-30.5 31.6,-32.7 32.6,-33.5 33.2,-34.2 33.5,-34.7 33.7,-35.2
        33.8,-37.2 33.9,-40.8 34.1,-44.3 34,-46.1 33.7,-46.2 33.5,-46.3 32.8,-46.1 31.6,-45.6 30.7,-45.1 30,-44.9
        29.5,-45 29,-45.1 28.5,-45.9 27.9,-47.3 27.2,-48.6 27.1,-49.6 27.4,-50.1 27.7,-50.6 28.8,-51.3 30.6,-52.2
        32.6,-53.1 33.8,-53.7 34.1,-53.9 34.8,-54.2 35.2,-56.4 35.3,-60.5 z
      `
    },
    { // 所
      bounds: [9, -80.5, 82, 90.356],
      outline: `
        M 67.5,-58.8 C 70.3,-59.2 72.3,-58.8 73.5,-57.5 74.2,-56.7 74.6,-56 74.6,-55.3 74.6,-54.6 74.8,-54.1
        75.1,-53.8 75.8,-53.3 77.1,-53.4 79.1,-54.1 79.8,-54.3 81.1,-54.4 83.2,-54.4 85.2,-54.4 86.4,-54.3
        86.7,-54.1 87.3,-53.6 88.2,-52.7 89.3,-51.3 90.4,-49.8 91,-49 91,-48.7 91,-48.4 90.4,-47.6 89.3,-46.3 L
        87.7,-44.4 80.9,-44.6 74.2,-44.8 74.2,-29.3 C 74.3,-11.8 74.1,-2.7 73.8,-2.2 73.4,-1.8 72.9,0.6 72.3,4.9
        72.2,5.5 72,6.1 71.6,6.8 71.1,7.5 70.9,8.1 70.9,8.5 70.9,8.9 70.5,9.2 69.8,9.5 69.3,9.8 69,9.9 68.8,9.9
        68.6,9.8 68.3,9.6 68,9.1 67.5,8.5 67.2,7.8 67.2,7.1 67.2,6.4 67.1,5.9 66.8,5.6 66.6,5.3 66.4,-2.8
        66.2,-18.8 66,-34.8 65.9,-43 65.9,-43.3 65.9,-43.6 65,-43.5 63.1,-43 L 60.4,-42.2 59.9,-39.3 58.9,-33.1 C
        58.4,-29.9 57.5,-27.3 56,-25.3 55.2,-24.4 54.8,-23.8 54.8,-23.6 54.8,-23.4 54,-22.3 52.4,-20.1 50.7,-18
        49.7,-16.8 49.3,-16.3 48.6,-15.8 47.6,-15.1 46.3,-14.2 44.9,-13.3 44,-12.7 43.6,-12.5 43.1,-12.4
        42.4,-12.5 41.5,-13 L 40,-13.5 42.8,-16.3 C 44.7,-18.2 45.8,-19.4 46,-20 46.2,-20.6 46.4,-20.9 46.6,-20.9
        46.8,-20.9 47.3,-21.7 48,-23.3 48.7,-24.8 49.2,-25.8 49.5,-26.4 49.8,-26.8 49.9,-27.4 49.9,-28.1
        49.9,-28.7 50.1,-29.5 50.5,-30.6 50.9,-31.7 51.1,-32.9 51.1,-34.4 51.1,-35.8 51.3,-37.4 51.8,-39.3
        52.3,-41.1 52.4,-42.2 52.3,-42.7 52.1,-43.1 51.8,-45.2 51.5,-49 51.3,-52.8 51.3,-55 51.7,-55.6 52.8,-57.1
        54.4,-57.2 56.5,-55.7 57.4,-55.2 57.9,-54.7 58.2,-54.4 58.5,-54.1 58.6,-53.7 58.6,-53.2 58.6,-52.1
        58.9,-50.7 59.6,-49 59.6,-48.9 60.3,-49.1 61.8,-49.7 63.2,-50.2 64.2,-50.5 64.9,-50.5 65.4,-50.5
        65.7,-50.6 65.8,-50.9 65.9,-51.1 65.9,-51.6 65.9,-52.5 65.9,-53.8 65.7,-54.7 65.4,-55 65.1,-55.4
        65.1,-55.7 65.4,-55.8 65.7,-55.8 65.9,-56.4 65.9,-57.3 65.9,-58 66,-58.4 66.2,-58.5 66.3,-58.6 66.8,-58.7
        67.5,-58.8 z M 42.7,-77.7 C 43.3,-77.9 43.6,-78 43.7,-78 43.7,-78 44.1,-77.6 45,-76.8 46.9,-75.1 48.1,-74
        48.5,-73.3 48.8,-72.7 48.9,-71.8 48.8,-70.6 48.7,-70 48.5,-69.5 48.3,-69.2 47.9,-68.9 47.4,-68.4
        46.6,-67.8 45.3,-66.9 44.4,-66.5 43.9,-66.5 43.4,-66.5 42.7,-66 41.7,-65 40.7,-64 39.8,-63.3 39,-62.9
        38.2,-62.5 37.3,-62 36.3,-61.4 35.2,-60.7 34.5,-60.4 34.1,-60.4 33.8,-60.4 33.2,-60.2 32.1,-59.8 31,-59.3
        30.4,-59 30.2,-58.7 29.9,-58.5 29.2,-58.1 28.1,-57.5 27,-57 26.2,-56.7 25.9,-56.7 25.5,-56.7 25.3,-57.2
        25.3,-58.1 25.3,-58.6 25.5,-59.1 25.8,-59.6 26,-60.1 26.8,-60.8 28.1,-61.8 29.8,-63.5 32.3,-65.9
        35.4,-69.2 38.4,-72.4 40,-74.2 40,-74.5 40,-74.8 40.4,-75.3 41.1,-76.2 41.8,-77 42.4,-77.5 42.7,-77.7 z M
        65.2,-77.8 C 65.5,-78.3 65.9,-78.6 66.4,-78.8 66.9,-78.8 67.2,-79 67.2,-79.3 67.2,-79.6 67.5,-79.8
        68.1,-80.1 68.7,-80.4 69,-80.5 69.1,-80.5 69.2,-80.5 69.8,-79.9 71,-78.8 72.2,-77.6 73.2,-76.7 74.1,-76
        74.8,-75.4 75.4,-74.6 75.7,-73.8 76,-72.8 76,-72 75.7,-71.3 75.4,-70.4 74.5,-69.6 73,-68.9 71.5,-68.2
        70.1,-67.8 68.8,-67.8 67.9,-67.8 66.8,-67.4 65.7,-66.6 64.5,-65.7 63,-64.9 61.3,-64.1 59.5,-63.2
        58.6,-62.7 58.6,-62.4 58.6,-62.1 58.4,-62 58,-62 57.7,-62 56.4,-61.4 54.2,-60.1 52,-58.8 50,-57.8
        48.3,-56.9 46.4,-56 45.4,-55.5 45.3,-55.2 45.3,-55 45.6,-54.7 46.1,-54.4 47,-53.9 47.7,-53.2 48.4,-52.1
        48.8,-51.4 49,-50.9 49.2,-50.5 49.3,-50 49.2,-49.4 49,-48.7 48.8,-47.6 48.5,-47 48.1,-46.7 47.8,-46.6
        47.5,-45.6 47.2,-43.8 46.8,-41.9 46.5,-40 46.4,-38 46.2,-36.1 45.7,-34.6 44.9,-33.5 44.1,-32.4 43.3,-31
        42.5,-29.3 41.6,-27.5 40.9,-26.5 40.4,-26.2 39.9,-25.9 39.3,-25.9 38.8,-26.1 38.3,-26.2 37.9,-26.6
        37.8,-27.1 37.6,-27.7 37.2,-28.3 36.6,-28.8 36,-29.3 35.5,-29.5 35.2,-29.5 34.7,-29.5 34.2,-29.2
        33.5,-28.7 32.9,-28.3 32.1,-28 31.1,-27.9 30,-27.8 29.4,-27.9 29.2,-28.3 28.6,-29.2 27.9,-28.6 27.1,-26.5
        27.1,-26.4 27,-26.2 26.9,-26.1 26.4,-24.4 26,-23 25.5,-22.1 25.1,-21.3 24.1,-20 22.6,-18.2 21,-16.4
        20,-15.5 19.5,-15.5 19.2,-15.5 19,-15.3 18.9,-14.9 18.7,-14.5 18,-13.9 16.9,-13.1 15.7,-12.3 14.9,-11.7
        14.6,-11.4 14.2,-11 13.2,-10.6 11.7,-10.1 9.9,-9.6 9,-9.6 9,-10.3 9,-11.2 10.6,-13.5 13.8,-17 14.7,-17.8
        15.2,-18.5 15.4,-19.1 15.7,-19.6 16.1,-20.3 16.6,-21.1 17.1,-21.9 17.7,-22.9 18.3,-24 18.9,-25 19.3,-25.7
        19.5,-25.9 19.9,-26.1 20.4,-27 20.9,-28.6 21.4,-30.3 21.9,-31.9 22.2,-33.5 22.5,-35.6 22.7,-38.3
        22.6,-41.8 22.6,-45.3 22.3,-48.1 21.8,-50.2 21.7,-50.7 21.7,-51.1 21.6,-51.6 21.5,-52.1 21.5,-52.4
        21.5,-52.6 21.5,-52.8 21.5,-52.9 21.6,-52.9 21.9,-52.9 22,-53.3 22,-54.2 22,-55 22.2,-55.6 22.6,-55.9
        23.1,-56.3 23.8,-56.2 24.8,-55.6 25.8,-55 26.6,-54.2 27.1,-53.2 27.6,-52.2 28.1,-51.7 28.5,-51.7
        28.9,-51.7 30.7,-52.3 33.8,-53.5 36.9,-54.8 38.9,-55.6 39.8,-56.1 40.5,-56.5 41.1,-56.7 41.6,-56.7
        42.1,-56.7 43.5,-57.4 45.5,-58.8 47.6,-60.1 49.3,-61.4 50.4,-62.5 50.8,-62.8 51.5,-63.3 52.4,-64
        53.9,-65.1 56.3,-67.5 59.7,-71.2 63.1,-74.8 64.9,-77 65.2,-77.8 z M 36.7,-46.7 L 37,-49.3 35.9,-49.3 C
        35.2,-49.3 34.5,-49 33.7,-48.5 32.9,-47.9 32.1,-47.5 31.4,-47.4 30.7,-47.3 30,-46.9 29.4,-46.3 29,-45.8
        28.8,-45.3 28.6,-44.7 28.5,-44.1 28.5,-42.8 28.5,-40.8 28.5,-37.8 28.5,-36.2 28.5,-36.1 28.5,-36 29,-36.1
        30,-36.5 30.9,-37 31.9,-37.5 33,-38.1 34,-38.7 34.6,-39.1 34.8,-39.3 35.5,-40 36.1,-42.5 36.7,-46.7 z
      `
    },
    { // 困
      bounds: [18.473, -78.773, 63.082, 86.873],
      outline: `
        M 50.8,-22.5 C 54.1,-22.8 57.4,-22.9 60.7,-23 64,-23 65.8,-22.9 66.3,-22.7 67.9,-21.9 68.4,-20.1
        67.7,-17.3 67.3,-15.4 66.5,-14.3 65.4,-13.9 64.3,-13.4 62.4,-13.5 59.8,-14.2 58,-14.8 54.8,-15 50.2,-14.9
        46.2,-14.9 43.2,-14.7 41.3,-14.4 39.4,-14 37.8,-13.3 36.7,-12.2 35.8,-11.4 35,-11 34.1,-11 33.6,-11
        32.8,-11.3 31.9,-11.8 30.9,-12.3 30.2,-12.8 29.9,-13.3 29.6,-13.8 29.6,-14.5 29.7,-15.4 29.8,-16.3
        30.1,-17 30.6,-17.4 31.4,-18.1 33.8,-19 37.7,-20.3 41.5,-21.6 44.2,-22.2 45.6,-22.2 46.3,-22.1 48.1,-22.2
        50.8,-22.5 z M 53,-46.6 C 53,-47.5 55.2,-47.4 59.6,-46.3 63.9,-45.2 66,-44.3 66,-43.4 66,-43.1 66.1,-43
        66.4,-43 67.3,-43 68,-42.3 68.3,-41 68.7,-39.6 68.6,-38.4 68,-37.5 67.6,-37 67.4,-36.5 67.3,-36.1
        67.3,-35.6 67,-35.2 66.5,-34.7 66,-34.2 65.4,-33.9 64.9,-33.9 63.1,-34 60.3,-35.9 56.4,-39.6 55.3,-40.6
        54.4,-41.3 53.8,-41.7 53.5,-42 53.2,-42.5 52.9,-43.2 52.6,-43.8 52.5,-44.5 52.4,-45 52.3,-45.6 52.4,-46
        52.6,-46.1 52.9,-46.1 53,-46.3 53,-46.6 z M 25.1,-63 C 25.4,-63.5,26,-63.2,27.1,-62.1 L 28.4,-60.9
        27.9,-56.4 C 26.8,-46.5 26.1,-38 25.8,-30.7 25.7,-26.4 25.5,-23.9 25.4,-23.3 25.3,-22.7 25.1,-20.8
        25.1,-17.6 24.9,-14.5 24.8,-12.4 24.5,-11.5 24,-9 23.6,-7.4 23.4,-7 23.2,-6.4 22.9,-6.2 22.6,-6.2 22,-6.2
        21.3,-6.8 20.6,-7.9 20,-9 19.5,-10.2 19.4,-11.4 19.3,-12.7 19,-13.7 18.7,-14.4 18.4,-15.2 18.4,-16
        18.8,-16.7 20.3,-19.1 21.4,-26.6 22.2,-39.2 22.5,-43.6 22.8,-46.7 23.1,-48.4 23.4,-50.1 23.5,-51.8
        23.5,-53.5 23.5,-54.6 23.7,-56.4 24.1,-58.8 24.5,-61.2 24.8,-62.6 25.1,-63 z M 46.3,-63.8 C 46.4,-66.5
        46.7,-68.2 47.2,-68.8 47.7,-69.5 48,-69.8 48.3,-69.8 48.8,-69.9 49.5,-69.6 50.4,-69.1 51.3,-68.5
        51.9,-67.9 52.3,-67.4 53,-65.9 53,-64.6 52.3,-63.5 51.8,-62.9 51.6,-62 51.7,-60.9 51.8,-60 52,-59.5
        52.5,-59.4 52.9,-59.3 54.4,-59.4 57,-59.7 58.4,-59.9 59.9,-59.8 61.7,-59.4 63.3,-59 64.4,-58.5 64.9,-57.9
        65.6,-57 65.2,-55.5 63.7,-53.4 63.2,-52.7 62.1,-52.4 60.7,-52.4 59.1,-52.4 57.9,-52.7 56.8,-53.3
        55.6,-54.1 54.7,-54.4 54,-54.3 53.3,-54.2 52.8,-53.5 52.4,-52.4 51.1,-48.9 50.4,-44.7 50.2,-39.7
        49.9,-32.7 49.3,-27.9 48.3,-25.3 48,-24.6 47.7,-24.1 47.5,-23.9 47.2,-23.7 46.8,-23.6 46.4,-23.6
        45.8,-23.6 45.5,-23.7 45.4,-23.9 45.2,-24 45.1,-24.3 45.1,-24.8 45.1,-25.5 44.9,-26.7 44.5,-28.3
        44.1,-29.8 44,-32.2 44.2,-35.3 44.3,-38.4 44.3,-40 44.1,-40 43.5,-40 42.2,-39.1 40.2,-37.2 39.6,-36.6
        38.4,-35.7 36.5,-34.4 34.6,-33.1 33.4,-32.2 32.9,-31.6 32.3,-31.1 31.8,-30.8 31.5,-30.8 31.2,-30.8
        30.8,-30.6 30.4,-30.1 30.1,-29.9 29.5,-29.6 28.6,-29.1 27.6,-28.6 27,-28.3 26.7,-28.3 26.3,-28.3
        26.6,-28.9 27.5,-30.1 27.6,-30.3 27.7,-30.4 27.8,-30.5 28.3,-31 29.1,-31.9 30.2,-33.3 31.3,-34.6
        32.1,-35.5 32.5,-36 33,-36.5 33.7,-37.4 34.7,-38.7 35.7,-40 36.4,-40.8 36.7,-41 37.2,-41.5 38.8,-43.5
        41.3,-47 43.8,-50.5 45.1,-52.4 45.1,-52.7 45,-52.8 44.8,-52.8 44.3,-52.8 43.8,-52.7 43.2,-52.6 42.5,-52.5
        41.7,-52.4 41,-52.2 40.5,-52 39.4,-51.7 38.5,-51.2 37.8,-50.5 37.1,-49.9 36.6,-49.6 36.2,-49.6 35.7,-49.6
        35.2,-49.8 34.5,-50.3 32.6,-51.5 32.9,-53 35.5,-54.7 37.3,-55.9 39.8,-56.8 42.9,-57.4 44.3,-57.7
        45.2,-58.2 45.5,-58.8 45.8,-59.4 46.1,-61.1 46.3,-63.8 z M 28.4,-73.3 C 29.8,-74.2 32.1,-75 35.4,-75.7
        38.6,-76.4 40.8,-76.9 42.2,-77.2 43.5,-77.4 45.2,-77.7 47.5,-77.9 49.7,-78.1 51.2,-78.3 52,-78.6
        52.8,-78.8 53.8,-78.8 54.9,-78.7 56,-78.6 58.1,-78.4 61.1,-78.1 72.2,-77 78.8,-75.4 80.8,-73.2 81.3,-72.7
        81.5,-71.8 81.6,-70.6 81.6,-69.3 81.4,-68.3 81.1,-67.6 80.7,-66.9 80.4,-61.9 80.1,-52.4 80,-42.9
        79.8,-35.8 79.7,-31.3 79.4,-22.6 79.5,-17.7 79.8,-16.8 80.1,-16.1 80.3,-14.1 80.3,-10.7 80.4,-7.3
        80.2,-4.9 79.7,-3.6 78.9,-1.7 78.3,-0.5 77.8,0.2 77.4,0.9 76.8,1.5 76,2 75,2.7 73.9,3.6 72.6,4.7 72,5.4
        70.9,6.1 69.3,6.9 67.8,7.7 66.7,8.1 66.2,8.1 66.1,8.1 66,7.7 65.8,6.9 65.3,4.2 64.4,2.4 63.2,1.7 62.5,1.2
        62.1,0.8 62.1,0.5 62.1,0.2 61.6,-0.3 60.7,-0.9 59.7,-1.5 58.8,-1.9 58,-2.1 57.3,-2.3 56.7,-2.7 56.2,-3.2
        55.6,-3.7 55,-4 54.4,-4.2 53.7,-4.4 53.4,-4.6 53.4,-4.9 53.4,-5.4 55.1,-5.8 58.5,-6.2 63.5,-6.8 66.7,-7.7
        68,-8.9 68.5,-9.4 69,-9.7 69.3,-9.7 69.6,-9.7 70,-10 70.3,-10.7 70.6,-11.6 70.8,-18.2 70.8,-30.6
        70.8,-42.9 70.6,-51.6 70.3,-56.5 70,-60.3 69.8,-62.8 69.7,-64 69.5,-65.1 69.1,-66.3 68.5,-67.5 67.8,-69.2
        67.3,-70.3 67.2,-70.9 67.1,-71.5 66,-72 64,-72.5 58.7,-73.8 55.1,-74.5 53.2,-74.4 47.1,-74 42.4,-73.2
        38.9,-72.1 35.4,-71 33.2,-70.2 32.3,-69.8 31.4,-69.3 30.6,-68.7 30,-67.9 29.3,-67 28.8,-66.4 28.4,-66.3
        27.9,-66.2 27.4,-66.3 26.9,-66.8 26.4,-67.3 26.1,-68.2 26.2,-69.6 26.3,-70.6 26.4,-71.3 26.6,-71.7
        26.8,-72.1 27.4,-72.6 28.4,-73.3 z
      `
    }
  ];

  function between([ax, ay], [bx, by], amount) {
    return [ax + (bx - ax) * amount, ay + (by - ay) * amount];
  }

  function kink(a, b, offset, amount = 0.5) {
    const point = between(a, b, amount);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return [point[0] - dy * offset, point[1] + dx * offset];
  }

  function buildCracks(seed) {
    let sample = 0;
    const random = () => grainAt(sample++, seed);
    const count = 13 + Math.floor(random() * 4);
    const origin = [0, 0];
    const phase = random() * turn;
    const rays = Array.from({ length: count }, (_, index) => {
      const angle = phase + (index + (random() - 0.5) * 0.58) * turn / count;
      const reach = 0.79 + random() * 0.36;
      const spread = random() ** 1.4;
      const bend = random() * turn;
      return rings.map(([radius, first, last], ring) => {
        const direction = angle + 0.038 * Math.sin(ring * 1.16 + bend);
        const distance = radius * reach * (0.953 + random() * 0.094);
        return {
          point: [Math.cos(direction) * distance, Math.sin(direction) * distance],
          at: Math.round(first + (last - first) * spread)
        };
      });
    });
    const radial = rays.map((ray, index) => ray.map(({ point, at }, ring) => {
      const from = ring ? ray[ring - 1].point : origin;
      const [u, v] = between(from, point, 0.28 + random() * 0.42);
      const deflection = (random() - 0.5) * 0.034;
      const cosine = Math.cos(deflection);
      const sine = Math.sin(deflection);
      return {
        points: [from, [u * cosine - v * sine, u * sine + v * cosine], point],
        at, width: (index % 3 === 0 ? 0.00116 : 0.00081) * (1 - ring * 0.049)
      };
    }));
    const seams = rays.map((ray, index) => {
      const inset = 0.940 + random() * 0.041;
      const offset = 0.34 + random() * 0.32;
      return ray.map(({ point, at }, ring) => {
        const neighbor = rays[(index + 1) % count][ring];
        const [u, v] = between(point, neighbor.point, offset);
        return {
          points: [point, [u * inset, v * inset], neighbor.point],
          at: Math.max(at, neighbor.at),
          width: 0.00066 * (1 - ring * 0.056)
        };
      });
    });
    // A few long cracks run ahead of the opening on the first strike.
    for (const direction of [-2.98, -2.32, -1.66]) {
      const angle = direction + (random() - 0.5) * 0.28;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      let nearest = 0;
      let best = -Infinity;
      for (const [index, ray] of rays.entries()) {
        const [u, v] = ray[0].point;
        const alignment = (u * x + v * y) / Math.hypot(u, v);
        if (alignment > best) {
          nearest = index;
          best = alignment;
        }
      }
      const limit = random() < 0.57 ? 4 : 5;
      for (let ring = 3; ring <= limit; ring++) radial[nearest][ring].at = 1;
    }
    const spokes = radial.flat();
    const crossbars = seams.flatMap((ray, sector) => ray.filter((_, ring) => {
      const arc = Math.sin(sector * turn / count * 2 + ring * 2.1 + phase);
      return random() + arc * 0.39 > (ring < 3 ? 0.54 : 0.77);
    }));
    const cracks = [...spokes, ...crossbars];
    const panes = [];
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      for (const [ring, edge] of radial[i].entries()) {
        const across = seams[i][ring];
        const points = [...edge.points, ...across.points.slice(1), radial[next][ring].points[1]];
        if (ring) points.push(...seams[i][ring - 1].points.slice(1).reverse());
        const corners = [points[0], points[2], points[4]];
        if (ring) corners.push(points[6]);
        panes.push({ points, corners, ring, at: across.at });
      }
    }

    // Each impact adds a short fork growing out of a crack that already exists.
    for (let at = 1; at <= lastFracture; at++) {
      const available = spokes.filter((edge) => edge.at <= at);
      const branches = at === 1 ? 7 : 1;
      for (let branch = 0; branch < branches; branch++) {
        const { points: [, a, b] } = available[Math.floor(random() * available.length)];
        const from = between(a, b, 0.22 + random() * 0.70);
        const offset = (random() < 0.5 ? -1 : 1) * (0.32 + random() * 0.51);
        const end = kink(a, b, offset, 1.04 + random() * 0.48);
        cracks.push({
          points: [from, kink(from, end, (random() - 0.5) * 0.40), end],
          at, width: 0.00055 + random() * 0.00024, taper: true
        });
      }
    }
    return { cracks, panes };
  }

  function addPolygon(path, points, x, y, scale) {
    path.moveTo(x + points[0][0] * scale, y + points[0][1] * scale);
    for (const [u, v] of points.slice(1)) path.lineTo(x + u * scale, y + v * scale);
    path.closePath();
  }

  function addFractureGap(path, points, x, y, scale, width, taper) {
    const [start, middle, end] = points;
    const into = Math.atan2(middle[1] - start[1], middle[0] - start[0]);
    const out = Math.atan2(end[1] - middle[1], end[0] - middle[0]);
    const across = [-Math.sin(into) - Math.sin(out), Math.cos(into) + Math.cos(out)];
    const length = Math.hypot(...across) || 1;
    const nx = across[0] / length * width;
    const ny = across[1] / length * width;
    const startX = -Math.sin(into) * width * 0.87;
    const startY = Math.cos(into) * width * 0.87;
    const tipWidth = taper ? 0 : width * 0.76;
    const endX = -Math.sin(out) * tipWidth;
    const endY = Math.cos(out) * tipWidth;
    addPolygon(path, [
      [start[0] + startX, start[1] + startY],
      [middle[0] + nx, middle[1] + ny],
      [end[0] + endX, end[1] + endY],
      [end[0] - endX, end[1] - endY],
      [middle[0] - nx, middle[1] - ny],
      [start[0] - startX, start[1] - startY]
    ], x, y, scale);
  }

  function choosePalette(seed) {
    const key = 'made-of-what-i-buy.last-palette-family';
    let previous;
    try {
      previous = sessionStorage.getItem(key);
    } catch {
      // The page can still generate a palette when storage is disabled.
    }
    const families = [...new Set(palettes.map(({ family }) => family))].filter((family) => family !== previous);
    const family = families[Math.floor(grainAt(81, seed) * families.length)];
    const choices = palettes.filter((palette) => palette.family === family);
    try {
      sessionStorage.setItem(key, family);
    } catch {
      // Session storage only prevents consecutive repeats.
    }
    return choices[Math.floor(grainAt(82, seed) * choices.length)];
  }

  function lotusFan(count, radius, spread, seed) {
    const path = new Path2D();
    for (let index = 0; index < count; index++) {
      const side = index / (count - 1) * 2 - 1;
      const angle = -Math.PI / 2 + side * spread;
      const length = radius * (0.84 + grainAt(index, seed) * 0.16);
      const width = radius * (0.24 + grainAt(index + 19, seed) * 0.06);
      const forward = [Math.cos(angle), Math.sin(angle)];
      const point = (along, across) => [
        forward[0] * along - forward[1] * across,
        0.23 + forward[1] * along + forward[0] * across
      ];
      path.moveTo(0, 0.23);
      path.bezierCurveTo(...point(length * 0.22, -width * 0.73),
        ...point(length * 0.61, -width), ...point(length, width * side * 0.14));
      path.bezierCurveTo(...point(length * 0.70, width * 0.57),
        ...point(length * 0.33, width), 0, 0.23);
      path.closePath();
    }
    return path;
  }

  function lotusMark(seed) {
    return [
      { path: lotusFan(7, 1.10, 1.53, seed), tone: 0, opacity: 0.56 },
      { path: lotusFan(5, 0.83, 1.27, hashCell(1, seed)), tone: 1, opacity: 0.58 },
      { path: lotusFan(3, 0.57, 1.12, hashCell(2, seed)), tone: 2, opacity: 0.88 }
    ];
  }

  function starMark(seed) {
    const main = new Path2D();
    const small = new Path2D();
    const rays = 6 + Math.floor(grainAt(1, seed) * 3);
    const cluster = [[0, 0, 0.92], [-0.84, -0.39, 0.26], [0.91, 0.35, 0.19], [0.49, -0.70, 0.13]];
    for (const [star, [x, y, radius]] of cluster.entries()) {
      const phase = grainAt(star + 2, seed) * turn;
      const points = Array.from({ length: rays * 2 }, (_, index) => {
        const angle = phase + index / (rays * 2) * turn;
        const reach = radius * (index % 2 ? 0.19 : 0.68 + grainAt(index + star * 31, seed) * 0.32);
        return [Math.cos(angle) * reach, Math.sin(angle) * reach];
      });
      addPolygon(star ? small : main, points, x, y, 1);
    }
    return [{ path: main, tone: 0, opacity: 0.77 }, { path: small, tone: 2, opacity: 0.87 }];
  }

  function checkerMark(seed) {
    const paper = new Path2D();
    const checks = new Path2D();
    const columns = 6 + Math.floor(grainAt(2, seed) * 4);
    const rows = 4 + Math.floor(grainAt(3, seed) * 2);
    const phase = grainAt(4, seed) * turn;
    const point = (column, row) => {
      const u = column / columns - 0.5;
      const v = row / rows - 0.5;
      return [u * 2 + 0.13 * Math.sin(u * 5 + v * 3 + phase),
        v * (0.97 - u * 0.34) + 0.28 * Math.sin(u * 5 + phase) - u * 0.23];
    };
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const corner = (column < 2 || column > columns - 3) && (row === 0 || row === rows - 1);
        if (corner && grainAt(row * columns + column + 7, seed) < 0.38) continue;
        const cell = [point(column, row), point(column + 1, row), point(column + 1, row + 1), point(column, row + 1)];
        addPolygon(paper, cell, 0, 0, 1);
        if ((column + row) % 2 === 0) addPolygon(checks, cell, 0, 0, 1);
      }
    }
    return [{ path: paper, tone: 0, opacity: 0.61 }, { path: checks, tone: 1, opacity: 0.88 }];
  }

  function buildPattern(palette, seed) {
    const makers = { lotus: lotusMark, stars: starMark, checkers: checkerMark };
    const type = palette.patterns[Math.floor(grainAt(1, seed) * palette.patterns.length)];
    const placements = [[0.473, 0.463, 0.086], [0.353, 0.395, 0.058], [0.499, 0.274, 0.052]];
    return placements.map(([x, y, radius], index) => {
      const key = index * 13 + 21;
      const make = index === 2 && type === 'checkers' ? starMark : makers[type];
      return {
        x: x + (grainAt(key, seed) - 0.5) * 0.050,
        y: y + (grainAt(key + 1, seed) - 0.5) * 0.048,
        radius: radius * (0.80 + grainAt(key + 2, seed) * 0.46),
        angle: (grainAt(key + 3, seed) - 0.5) * 0.83,
        parts: make(hashCell(key, seed))
      };
    });
  }

  function paintPattern(context, artwork, phase) {
    const { palette, pattern } = artwork;
    const inks = [palette.glow[0], palette.field[0], palette.glow[1]];
    for (const [index, { x, y, radius, angle, parts }] of pattern.entries()) {
      const drift = Math.sin(phase + index * 1.62);
      context.save();
      context.translate(x + drift * 0.008, y + Math.cos(phase + index) * 0.008);
      context.rotate(angle + drift * 0.088);
      context.scale(radius, radius);
      for (const { path, tone, opacity } of parts) {
        context.globalAlpha = opacity * (index ? 0.48 : 0.57);
        context.fillStyle = inks[tone];
        context.fill(path);
      }
      context.restore();
    }
  }

  function buildColorRamp(palette) {
    const strip = document.createElement('canvas');
    strip.width = 1024;
    strip.height = 1;
    const context = strip.getContext('2d');
    const ramp = context.createLinearGradient(0, 0, strip.width, 0);
    const stops = [0, 0.19, 0.42, 0.64, 0.84, 1];
    const colors = [...palette.field, palette.glow[0]];
    colors.forEach((color, index) => ramp.addColorStop(stops[index], color));
    context.fillStyle = ramp;
    context.fillRect(0, 0, strip.width, 1);
    return new Uint32Array(context.getImageData(0, 0, strip.width, 1).data.buffer);
  }

  function sampleField(field, index, stride, across, down) {
    const top = field[index] + (field[index + 1] - field[index]) * across;
    const bottom = index + stride;
    const next = field[bottom] + (field[bottom + 1] - field[bottom]) * across;
    return top + (next - top) * down;
  }

  function buildMarbledGradient(side, seed, palette) {
    const gradient = document.createElement('canvas');
    gradient.width = gradient.height = side;
    const context = gradient.getContext('2d', { alpha: false });
    const image = context.createImageData(side, side);
    const pixels = new Uint32Array(image.data.buffer);
    const ramp = buildColorRamp(palette);
    const lastColor = ramp.length - 1;

    const angle = grainAt(5, seed) * turn;
    const phase = grainAt(6, seed) * turn;
    const offset = grainAt(7, seed) * turn;
    const stretch = 0.88 + grainAt(8, seed) * 0.28;
    const frequency = 216 + grainAt(9, seed) * 54;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    // Sample the broad swirls on a grid and add the fine veins at full texture resolution.
    const stride = 129;
    const intervals = stride - 1;
    const flow = new Float32Array(stride * stride);
    const light = new Float32Array(flow.length);
    for (let row = 0; row < stride; row++) {
      const y = (row / intervals - 0.5) * stretch;
      for (let column = 0; column < stride; column++) {
        const x = (column / intervals - 0.5) * stretch;
        const u = x * cosine - y * sine;
        const v = x * sine + y * cosine;
        const curlX = u + 0.18 * Math.sin(v * 8.7 + 2.1 * Math.sin(u * 6.2 + phase))
          + 0.065 * Math.sin((u + v) * 16 - offset);
        const curlY = v + 0.16 * Math.sin(u * 8.2 - 2.2 * Math.sin(v * 6.8 + offset))
          + 0.052 * Math.sin((u - v) * 19.4 + phase);
        const index = row * stride + column;
        flow[index] = curlY + 0.22 * Math.sin(curlX * 9.5 + curlY * 3.1 + offset)
          + 0.061 * Math.sin(curlY * 17.2 - curlX * 14.6 - phase);
        light[index] = 0.48 + 0.17 * Math.sin(curlX * 9.8 - curlY * 7.2 + phase)
          + 0.14 * Math.sin(curlY * 13 + curlX * 5.4 - offset);
      }
    }

    const step = intervals / side;
    for (let row = 0; row < side; row++) {
      const y = (row + 0.5) * step;
      const top = Math.floor(y);
      for (let column = 0; column < side; column++) {
        const x = (column + 0.5) * step;
        const left = Math.floor(x);
        const index = top * stride + left;
        const phaseAtPixel = sampleField(flow, index, stride, x - left, y - top);
        const lightAtPixel = sampleField(light, index, stride, x - left, y - top);
        const ribbon = Math.sin(phaseAtPixel * 58 + phase);
        const ripples = Math.sin(phaseAtPixel * frequency + lightAtPixel * 10);
        const crest = 0.5 + 0.5 * Math.sin(phaseAtPixel * frequency * 1.82 - lightAtPixel * 12 - offset);
        const tone = clamp(lightAtPixel + 0.125 * ribbon + 0.088 * ripples + 0.13 * crest ** 4, 0, 1);
        pixels[row * side + column] = ramp[Math.round(tone * lastColor)];
      }
    }
    context.putImageData(image, 0, 0);
    return gradient;
  }

  function paintMist(context, x, y, radius, color, opacity) {
    const light = context.createRadialGradient(x, y, 0, x, y, radius);
    light.addColorStop(0, color);
    light.addColorStop(1, color + '00');
    context.save();
    context.globalAlpha = opacity;
    context.fillStyle = light;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    context.restore();
  }

  function paintCutout(context, { x, y, width, height, angle, color }, seed, light) {
    const shape = new Path2D();
    const edge = [
      [-0.50, -0.43], [0.11, -0.50], [0.50, -0.34], [0.46, 0.44],
      [0.17, 0.46], [0.10, 0.30], [-0.50, 0.50]
    ];
    addPolygon(shape, edge.map(([u, v]) => [u * width, v * height]), 0, 0, 1);

    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.clip(shape);
    const ink = context.createLinearGradient(-width * 0.2, -height * 0.45, width * 0.3, height * 0.47);
    ink.addColorStop(0, color + 'dc');
    ink.addColorStop(0.57, color + 'a6');
    ink.addColorStop(1, color + '14');
    context.fillStyle = ink;
    context.fillRect(-width / 2, -height / 2, width, height);
    context.fillStyle = light + '52';
    for (let fleck = 0; fleck < 92; fleck++) {
      const key = fleck * 4;
      const size = 0.0006 + grainAt(key + 2, seed) * 0.0019;
      context.fillRect((grainAt(key, seed) - 0.5) * width, (grainAt(key + 1, seed) - 0.5) * height, size * 1.6, size);
    }
    context.restore();
  }

  function paintMembrane(context, { x, y, radius, squash, angle, phase }, palette) {
    const glass = new Path2D();
    const edge = Array.from({ length: 88 }, (_, step) => {
      const direction = step / 88 * turn;
      const reach = 0.89 + 0.12 * Math.sin(3 * direction + phase) + 0.075 * Math.cos(2 * direction - phase);
      return [reach * Math.cos(direction), reach * Math.sin(direction)];
    });
    addPolygon(glass, edge, 0, 0, 1);

    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.scale(radius, radius * squash);
    context.clip(glass);
    const body = context.createRadialGradient(-0.19, 0.16, 0.18, 0, 0, 1.05);
    body.addColorStop(0, palette.field[0] + '92');
    body.addColorStop(0.49, palette.field[1] + '68');
    body.addColorStop(0.70, palette.field[3] + '42');
    body.addColorStop(0.90, palette.glow[1] + 'a8');
    body.addColorStop(1, palette.glow[0]);
    context.fillStyle = body;
    context.fillRect(-1.11, -1.11, 2.22, 2.22);

    const rim = context.createLinearGradient(-0.74, -0.80, 0.68, 0.86);
    rim.addColorStop(0, '#fff9ed');
    rim.addColorStop(0.34, palette.glow[0] + 'cf');
    rim.addColorStop(0.60, palette.glow[1] + '59');
    rim.addColorStop(1, '#fffaf0e6');
    context.strokeStyle = rim;
    context.lineWidth = 0.115;
    context.stroke(glass);
    context.restore();
  }

  function paintChrome(context, x, y, radius, angle, spokes, palette) {
    const shape = new Path2D();
    const points = [];
    for (let spoke = 0; spoke < spokes; spoke++) {
      const direction = angle + spoke / spokes * turn;
      const length = radius * (spoke % 2 ? 0.80 : 1);
      const cosine = Math.cos(direction);
      const sine = Math.sin(direction);
      const corners = [[radius * 0.25, -0.13], [length, -0.12], [length * 0.98, 0.11], [radius * 0.25, 0.13]];
      for (const [depth, width] of corners) {
        points.push([cosine * depth - sine * width * radius, sine * depth + cosine * width * radius]);
      }
    }
    addPolygon(shape, points, x, y, 1);
    const chrome = context.createLinearGradient(x - radius, y - radius, x + radius * 0.45, y + radius);
    chrome.addColorStop(0, '#fff7ea');
    chrome.addColorStop(0.27, '#c6ccd0');
    chrome.addColorStop(0.45, palette.field[0]);
    chrome.addColorStop(0.515, '#fff7eb');
    chrome.addColorStop(0.62, palette.glow[1]);
    chrome.addColorStop(0.78, palette.field[1]);
    chrome.addColorStop(1, palette.glow[0]);
    context.fillStyle = chrome;
    context.fill(shape);
    context.strokeStyle = '#fff5e6d6';
    context.lineWidth = 0.0011;
    context.stroke(shape);
  }

  function buildArtwork(side, seed, palette) {
    const plate = buildMarbledGradient(side, seed, palette);
    const context = plate.getContext('2d');
    const x = 0.447 + (grainAt(3, seed) - 0.5) * 0.040;
    const y = 0.472 + (grainAt(5, seed) - 0.5) * 0.054;
    const angle = -0.34 + grainAt(9, seed) * 0.53;
    const phase = grainAt(11, seed) * turn;
    const spokes = grainAt(13, seed) > 0.5 ? 5 : 6;
    const pattern = buildPattern(palette, hashCell(24, seed));
    const pearl = palette.glow[0];
    context.setTransform(side, 0, 0, side, 0, 0);

    paintMist(context, x + 0.08, y - 0.1, 0.38, pearl, 0.52);
    paintPattern(context, { palette, pattern }, phase);
    paintCutout(context, { x: x - 0.12, y: y - 0.006, width: 0.44, height: 0.11,
      angle: angle - 0.28, color: palette.field[2] }, seed, pearl);
    paintCutout(context, { x: x - 0.15, y: y - 0.092, width: 0.24, height: 0.055,
      angle: angle + 0.32, color: palette.field[0] }, hashCell(seed, 41), pearl);
    paintCutout(context, { x: x + 0.069, y: y + 0.065, width: 0.29, height: 0.075,
      angle: angle - 0.44, color: pearl }, hashCell(seed, 61), pearl);

    for (let column = 0; column < 7; column++) {
      for (let row = 0; row < 5; row++) {
        context.fillStyle = (column + row) % 2 ? pearl + 'ca' : palette.field[0] + '80';
        context.fillRect(x - 0.104 + column * 0.006, y + 0.022 + row * 0.006, 0.006, 0.006);
      }
    }

    paintMembrane(context, { x: x - 0.055, y: y - 0.040, radius: 0.069, squash: 0.76, angle, phase }, palette);
    paintMembrane(context, { x: x + 0.024, y: y + 0.012, radius: 0.089, squash: 0.76,
      angle: angle - 0.77, phase: phase + 1.4 }, palette);

    context.fillStyle = pearl;
    for (let mark = 0; mark < 13; mark++) {
      const u = x - 0.18 + mark * 0.012;
      const v = y - 0.144 + 0.39 * (u - x);
      context.beginPath();
      context.arc(u, v, mark % 4 ? 0.001 : 0.0028, 0, turn);
      context.fill();
    }
    paintChrome(context, x - 0.137, y - 0.081, 0.042, angle + 0.69, spokes, palette);

    // Soften the collage as one image. The brush lettering is composited later.
    const softened = document.createElement('canvas');
    softened.width = softened.height = side;
    const softContext = softened.getContext('2d');
    const blur = side * 0.0042;
    const bleed = Math.ceil(blur * 3);
    softContext.filter = 'blur(' + blur + 'px)';
    softContext.drawImage(plate, -bleed, -bleed, side + bleed * 2, side + bleed * 2);
    return { softened, x, y, angle, phase, spokes, palette };
  }

  function paintBackdrop(context, x, y, size, artwork, time) {
    context.save();
    context.translate(x, y);
    context.scale(size, size);

    const { x: centerX, y: centerY, angle, phase, spokes, palette } = artwork;
    const progress = phase + time * 0.00037;
    const drift = Math.sin(progress);
    context.save();
    context.translate(0.5, 0.5);
    context.rotate(0.044 * drift);
    context.drawImage(artwork.softened, -0.535, -0.535, 1.07, 1.07);
    context.restore();

    paintMist(context, centerX + Math.cos(progress * 0.59) * 0.091,
      centerY + Math.sin(progress * 0.84) * 0.067, 0.14, palette.glow[0], 0.34);

    context.filter = 'blur(' + size * 0.0026 + 'px)';
    const silver = context.createLinearGradient(centerX - 0.17, centerY, centerX + 0.15, centerY);
    silver.addColorStop(0, '#fff9ed00');
    silver.addColorStop(0.29, '#fff7e5ae');
    silver.addColorStop(0.78, '#fff2e3f2');
    silver.addColorStop(1, '#fff9ed00');
    context.strokeStyle = silver;
    context.lineWidth = 0.0018;
    context.beginPath();
    context.ellipse(centerX - 0.023, centerY - 0.006, 0.188, 0.057 + drift * 0.011, angle - 0.25, 0.41, turn + 0.08);
    context.stroke();
    context.beginPath();
    context.ellipse(centerX - 0.023, centerY - 0.006, 0.167, 0.069, angle + 0.35, 3.21, turn + 0.75);
    context.stroke();
    paintChrome(context, centerX + 0.019 + 0.013 * drift, centerY - 0.007 + 0.010 * Math.cos(progress * 0.83),
      0.046, angle + 0.36 + time * 0.00012, spokes, palette);
    context.restore();
  }

  function buildPrints(side, seed, palette) {
    return inscription.map(({ bounds, outline }, index) => {
      const [left, top, width, height] = bounds;
      const characterSeed = hashCell(index, seed);
      const stamp = document.createElement('canvas');
      const scale = Math.max(1, side * 0.27 / height);
      stamp.width = Math.ceil(width * scale) + 4;
      stamp.height = Math.ceil(height * scale) + 4;
      const context = stamp.getContext('2d');
      context.setTransform(scale, 0, 0, scale, 2 - left * scale, 2 - top * scale);
      context.fillStyle = '#170c1b';
      context.fill(new Path2D(outline));

      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = '#00000093';
      const flecks = new Path2D();
      for (let fleck = 0; fleck < 470; fleck++) {
        const key = fleck * 4 + 19;
        const radius = 0.16 + grainAt(key + 2, characterSeed) ** 2 * 0.64;
        const tilt = grainAt(key + 3, characterSeed) * Math.PI;
        const u = left + grainAt(key, characterSeed) * width;
        const v = top + grainAt(key + 1, characterSeed) * height;
        const grainWidth = radius * 1.7;
        flecks.moveTo(u + Math.cos(tilt) * grainWidth, v + Math.sin(tilt) * grainWidth);
        flecks.ellipse(u, v, grainWidth, radius * 0.46, tilt, 0, turn);
        flecks.closePath();
      }
      context.fill(flecks);

      const pale = document.createElement('canvas');
      pale.width = stamp.width;
      pale.height = stamp.height;
      const paleContext = pale.getContext('2d');
      paleContext.drawImage(stamp, 0, 0);
      paleContext.globalCompositeOperation = 'source-in';
      paleContext.fillStyle = palette.glow[0];
      paleContext.fillRect(0, 0, pale.width, pale.height);
      return { stamp, pale };
    });
  }

  function scanReveal(context, aperture, fissures, { left, top, right, bottom }, origin) {
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);
    const span = Math.min(width, height);
    const spacing = Math.max(1, Math.max(width, height) / 22);
    const columns = Math.max(2, Math.ceil(width / spacing));
    const rows = Math.max(2, Math.ceil(height / spacing));
    const revealed = [];

    // The same paths used for rendering decide where the lettering can land.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    for (let row = 0; row < rows; row++) {
      const y = top + (row + 0.5) / rows * height;
      for (let column = 0; column < columns; column++) {
        const x = left + (column + 0.5) / columns * width;
        if (context.isPointInPath(aperture, x, y) && !context.isPointInPath(fissures, x, y)) {
          revealed.push({ x, y, distance: Math.hypot(x - origin.x, y - origin.y) });
        }
      }
    }
    context.restore();

    // Give the cart a little breathing room whenever the opening is big enough.
    const clear = revealed.filter(({ distance }) => distance > Math.min(46, span * 0.18));
    const points = (clear.length >= 4 ? clear : revealed).sort((a, b) => a.distance - b.distance);
    const third = Math.max(1, Math.ceil(points.length / 3));
    return { span, points, near: points.slice(0, third), far: points.slice(-third) };
  }

  function chooseLanding(points, used, seed, key) {
    let best;
    let spread = -1;
    for (let tryIndex = 0; tryIndex < 12; tryIndex++) {
      const candidate = points[Math.floor(grainAt(key + tryIndex, seed) * points.length)];
      const distance = used.reduce((nearest, point) =>
        Math.min(nearest, Math.hypot(candidate.x - point.x, candidate.y - point.y)), Infinity);
      if (distance <= spread) continue;
      best = candidate;
      spread = distance;
    }
    return best;
  }

  function paintPrints(context, prints, reveal, seed, time, force, hits, animate) {
    if (!reveal.points.length) return;
    const tempo = Math.max(61, 114 - hits * 1.7 - force * 34);
    const beat = animate ? Math.floor(time / tempo) : 0;
    const key = beat * 197 + hits * 221;
    const first = Math.floor(grainAt(key + 3, seed) * prints.length);
    const count = reveal.span < 108 ? 1 : reveal.span < 185 ? 2 : prints.length;
    const used = [];
    for (let index = 0; index < count; index++) {
      const hero = index === 0;
      const n = key + index * 31;
      const pool = hero && animate ? (beat % 2 ? reveal.far : reveal.near) : reveal.points;
      const landing = chooseLanding(pool, used, seed, n);
      used.push(landing);

      const { stamp, pale } = prints[(first + index) % prints.length];
      const ink = index === 2 || (index === 1 && beat % 5 === 2) ? pale : stamp;
      const depth = animate ? grainAt(n + 17, seed) : 0.5;
      const height = reveal.span * (hero ? 0.56 + depth * 0.38 : 0.26 + depth * 0.28);
      const width = height * (ink.width / ink.height) * (0.69 + grainAt(n + 18, seed) * 0.65);
      const angle = (grainAt(n + 19, seed) - 0.5) * (hero ? 0.53 : 0.73);
      const tear = animate && (index === 0 || grainAt(n + 20, seed) > 0.27);

      context.save();
      context.translate(landing.x, landing.y);
      context.rotate(angle);
      if (tear) {
        const from = Math.floor(ink.height * (0.15 + grainAt(n + 21, seed) * 0.24));
        const to = Math.floor(ink.height * (0.51 + grainAt(n + 22, seed) * 0.25));
        const bands = [0, from, to, ink.height];
        for (let band = 0; band < bands.length - 1; band++) {
          const start = bands[band];
          const strip = bands[band + 1] - start;
          const shear = (grainAt(n + 24 + band, seed) - 0.5) * width * (band === 1 ? 0.76 : 0.28);
          context.drawImage(ink, 0, start, ink.width, strip,
            -width / 2 + shear, -height / 2 + start / ink.height * height, width, strip / ink.height * height);
        }
      } else {
        context.drawImage(ink, -width / 2, -height / 2, width, height);
      }
      context.restore();
    }
  }

  function paintInterference(context, texture, seed, tick, force, palette) {
    const size = texture.width;
    const bands = Math.round(7 * force);
    const signalColors = [...palette.field.slice(1), ...palette.glow];
    for (let band = 0; band < bands; band++) {
      const key = tick * 61 + band * 11;
      const nearImpact = band < 4;
      const shift = Math.round((grainAt(key, seed) - 0.5) * size * (0.012 + 0.22 * force));
      const top = Math.floor(size * (nearImpact
        ? 0.42 + grainAt(key + 1, seed) * 0.16 : 0.06 + grainAt(key + 1, seed) * 0.80));
      const height = Math.ceil(1 + size * grainAt(key + 8, seed) * (nearImpact ? 0.003 + 0.013 * force : 0.002));
      context.drawImage(texture, 0, top, size, height, shift, top, size, height);
      const left = size * (0.30 + grainAt(key + 2, seed) * 0.22);
      const width = size * (0.028 + grainAt(key + 3, seed) * 0.15);
      const columns = 14 + Math.floor(grainAt(key + 5, seed) * 29);
      for (let stripe = 0; stripe < columns; stripe++) {
        context.fillStyle = signalColors[(stripe + band + Math.floor(grainAt(key + stripe + 479, seed) * 9)) % signalColors.length];
        context.fillRect(left + stripe * width / columns, top, Math.max(1, width / columns), height);
      }
    }
  }

  const fragmentLife = 980;

  function impactFragments(panes, seed, hits) {
    const fresh = panes.filter((pane) => pane.ring > 0 && pane.at === hits);
    const candidates = fresh.length >= 4 ? fresh : panes.filter((pane) => pane.ring === 1);
    return Array.from({ length: hits === 1 ? 15 : 7 }, (_, index) => {
      const key = hits * 271 + index * 13;
      const [a, b, c, d] = candidates[Math.floor(grainAt(key, seed) * candidates.length)].corners;
      const triangle = grainAt(key + 1, seed) > 0.5 ? [a, b, c] : [a, c, d];
      const center = [
        (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3,
        (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3
      ];
      const size = 0.28 + grainAt(key + 2, seed) * 0.72;
      const direction = Math.atan2(center[1], center[0]) + (grainAt(key + 3, seed) - 0.5) * 0.88;
      const speed = (0.10 + grainAt(key + 4, seed) * 0.24) * (hits === 1 ? 1.20 : 0.80);
      return {
        points: triangle.map((point) => between(center, point, size)),
        center,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed,
        lift: 0.38 + grainAt(key + 5, seed) * 0.37,
        pitch: (grainAt(key + 6, seed) - 0.5) * 5.4,
        yaw: (grainAt(key + 7, seed) - 0.5) * 5.1,
        roll: (grainAt(key + 8, seed) - 0.5) * 1.8,
        life: 620 + grainAt(key + 9, seed) * (fragmentLife - 620)
      };
    });
  }

  function drawFragment(context, texture, points, screen) {
    const uv = points.map(([x, y]) => [(0.5 + x / textureSpan) * texture.width, (0.5 + y / textureSpan) * texture.height]);
    const [[u, v], [u1, v1], [u2, v2]] = uv;
    const [[x, y], [x1, y1], [x2, y2]] = screen;
    const du1 = u1 - u, dv1 = v1 - v;
    const du2 = u2 - u, dv2 = v2 - v;
    const dx1 = x1 - x, dy1 = y1 - y;
    const dx2 = x2 - x, dy2 = y2 - y;
    const determinant = du1 * dv2 - du2 * dv1;
    if (Math.abs(determinant) < 1e-5 || Math.abs(dx1 * dy2 - dx2 * dy1) < 0.2) return;
    const a = (dx1 * dv2 - dx2 * dv1) / determinant;
    const b = (dy1 * dv2 - dy2 * dv1) / determinant;
    const c = (du1 * dx2 - du2 * dx1) / determinant;
    const d = (du1 * dy2 - du2 * dy1) / determinant;

    context.save();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.closePath();
    context.clip();
    // Map the original LCD pixels onto the three projected vertices.
    context.transform(a, b, c, d, x - a * u - c * v, y - b * u - d * v);
    context.drawImage(texture, 0, 0);
    context.restore();
  }

  function paintFlyingGlass(context, texture, { x, y }, scale, impacts, time) {
    const projected = [];
    for (const impact of impacts) {
      for (const shard of impact.fragments) {
        const progress = (time - impact.at) / shard.life;
        if (progress >= 1) continue;
        const throwDistance = 1 - (1 - progress) ** 2.8;
        const size = 1 - smoothstep(0.60, 1, progress);
        const pitch = shard.pitch * throwDistance;
        const yaw = shard.yaw * throwDistance;
        const roll = shard.roll * throwDistance;
        const depth = shard.lift * throwDistance;
        const [cx, cy] = shard.center;
        const worldX = cx + shard.vx * throwDistance;
        const worldY = cy + shard.vy * throwDistance + 0.23 * progress * progress;
        const screen = shard.points.map(([u, v]) => {
          const localX = (u - cx) * size;
          const localY = (v - cy) * size;
          const pitchY = localY * Math.cos(pitch);
          const pitchZ = localY * Math.sin(pitch);
          const yawX = localX * Math.cos(yaw) + pitchZ * Math.sin(yaw);
          const z = depth + pitchZ * Math.cos(yaw) - localX * Math.sin(yaw);
          const rotatedX = yawX * Math.cos(roll) - pitchY * Math.sin(roll);
          const rotatedY = yawX * Math.sin(roll) + pitchY * Math.cos(roll);
          const perspective = 1.36 / Math.max(0.36, 1.36 - z);
          return [x + (worldX + rotatedX) * scale * perspective, y + (worldY + rotatedY) * scale * perspective];
        });
        projected.push({ points: shard.points, screen, depth });
      }
    }
    projected.sort((a, b) => a.depth - b.depth);
    for (const { points, screen } of projected) drawFragment(context, texture, points, screen);
  }

  function create(canvas, seed) {
    const context = canvas.getContext('2d');
    const texture = document.createElement('canvas');
    const textureContext = texture.getContext('2d');
    const { cracks, panes } = buildCracks(seed);
    const artSeed = hashCell(seed, 71);
    const palette = choosePalette(artSeed);
    let width, height, origin, scale;
    let hits = 0;
    let lastImpact = -Infinity;
    let lastFrame = -1;
    let lastSignalFrame = -1;
    let impacts = [];
    let geometry;
    let backdrop;

    function resize(w, h, contact, density) {
      width = w;
      height = h;
      origin = contact;
      scale = Math.min(w, h);
      canvas.width = Math.ceil(w * density);
      canvas.height = Math.ceil(h * density);
      context.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
      const textureSide = Math.min(maxTextureSide, Math.ceil(scale * textureSpan * density));
      if (texture.width !== textureSide || texture.height !== textureSide) {
        texture.width = texture.height = textureSide;
        backdrop = null;
        lastSignalFrame = -1;
      }
      geometry = null;
      lastFrame = -1;
    }

    function strike(time) {
      hits++;
      lastImpact = time;
      if (hits <= lastFracture) geometry = null;
      impacts = impacts.filter(({ at }) => time - at < fragmentLife).slice(-2);
      impacts.push({ at: time, fragments: impactFragments(panes, artSeed, hits) });
      lastFrame = -1;
      lastSignalFrame = -1;
    }

    function pathsForImpact() {
      const aperture = new Path2D();
      const fissures = new Path2D();
      const { x, y } = origin;
      const bounds = { left: width, top: height, right: 0, bottom: 0 };
      for (const pane of panes) {
        if (pane.at > hits) continue;
        addPolygon(aperture, pane.points, x, y, scale);
        for (const [u, v] of pane.points) {
          const px = x + u * scale;
          const py = y + v * scale;
          bounds.left = Math.min(bounds.left, Math.max(0, px));
          bounds.top = Math.min(bounds.top, Math.max(0, py));
          bounds.right = Math.max(bounds.right, Math.min(width, px));
          bounds.bottom = Math.max(bounds.bottom, Math.min(height, py));
        }
      }
      for (const [index, crack] of cracks.entries()) {
        if (crack.at > hits) continue;
        const gap = crack.width * (0.79 + grainAt(1700 + index, seed) * 0.43);
        addFractureGap(fissures, crack.points, x, y, scale, gap, crack.taper);
      }
      const reveal = scanReveal(context, aperture, fissures, bounds, origin);
      return { aperture, fissures, reveal };
    }

    function draw(milliseconds, animate) {
      if (!hits) return;
      const age = milliseconds - lastImpact;
      const flying = animate && age < fragmentLife;
      const frame = animate ? Math.floor(milliseconds / (flying ? 20 : 49)) : 0;
      if (frame === lastFrame) return;
      lastFrame = frame;
      geometry ??= pathsForImpact();
      const { aperture, fissures, reveal } = geometry;
      backdrop ??= {
        artwork: buildArtwork(texture.width, artSeed, palette),
        prints: buildPrints(texture.width, artSeed, palette)
      };
      const force = animate ? Math.exp(-age / 185) : 0;
      const artTime = animate ? milliseconds : 0;
      const signalFrame = Math.floor(milliseconds / 49);
      if (flying && signalFrame !== lastSignalFrame) {
        lastSignalFrame = signalFrame;
        paintBackdrop(textureContext, 0, 0, texture.width, backdrop.artwork, artTime);
        if (force > 0.027) {
          paintInterference(textureContext, texture, artSeed, Math.floor(milliseconds / 100) + hits * 7, force, palette);
        }
      }
      context.clearRect(0, 0, width, height);
      const size = scale * textureSpan;
      const driftX = animate ? Math.sin(milliseconds * 0.00037) * scale * 0.012 : 0;
      const driftY = animate ? Math.sin(milliseconds * 0.00024 + 1.1) * scale * 0.011 : 0;
      const recoilX = Math.sin(age * 0.081) * force * scale * 0.038;
      const recoilY = Math.sin(age * 0.050) * force * scale * 0.021;
      const x = origin.x - size / 2 + driftX + recoilX;
      const y = origin.y - size / 2 + driftY + recoilY;

      context.save();
      context.clip(aperture);
      context.fillStyle = palette.field[0];
      context.fillRect(0, 0, width, height);
      if (flying) context.drawImage(texture, x, y, size, size);
      else paintBackdrop(context, x, y, size, backdrop.artwork, artTime);
      paintPrints(context, backdrop.prints, reveal, artSeed, artTime, force, hits, animate);
      context.globalCompositeOperation = 'destination-out';
      context.fill(fissures);
      context.restore();

      if (flying) paintFlyingGlass(context, texture, origin, scale, impacts, milliseconds);
    }

    return { resize, strike, draw, palette };
  }

  return { create };
})();

new p5((p) => {
  // Sample once per page load so the same choices hold while the scene is playing.
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  const asciiSeed = hashCell(seed, 1);
  const scanOrder = growthOrder(hashCell(seed, 2));
  const catalogSeed = hashCell(seed, 3);
  const windowSeed = hashCell(seed, 4);
  const fracture = screenFracture.create(document.getElementById('fractured-screen'), hashCell(seed, 5));
  const { field, glow, uiInlay, uiInk } = fracture.palette;
  const theme = document.documentElement.style;
  theme.setProperty('--ui-accent', field[2]);
  theme.setProperty('--ui-wash', field[3]);
  theme.setProperty('--ui-paper', glow[0]);
  theme.setProperty('--ui-inlay', uiInlay);
  theme.setProperty('--ui-ink', uiInk);
  const glyphs = glyphPalettes[Math.floor(grainAt(0, asciiSeed) * glyphPalettes.length)];
  const glyphScale = 0.9 + 0.26 * grainAt(1, asciiSeed);
  const restRetreat = 0.032 * grainAt(0, seed);
  const restLift = 0.105 * grainAt(1, seed);
  const boneMask = document.createElement('canvas');
  const maskContext = boneMask.getContext('2d', { willReadFrequently: true });
  const purchases = Array(scanCount).fill(null);
  const pointer = { x: 0, y: 0, active: false };
  const tracked = { x: 0, y: 0, vx: 0, vy: 0 };
  const press = { pointerId: null, space: false, until: 0, amount: 0, velocity: 0 };
  let notificationCount = 0;
  let notificationArrivals = 0;
  let capAnnounced = false;
  let lastNotificationUpdate = Infinity;
  let notificationCredit = 1;
  let cartGlow;
  let nextProduct = 0;
  let catalog = [];
  let importVersion = 0;
  let claim = null;
  let rig;
  let cellWidth;
  let cellHeight;

  function configureCanvas(width, height) {
    rig = viewportRig(width, height);
    rig.rest.x -= rig.scale * restRetreat;
    rig.rest.y -= rig.scale * restLift;
    cellHeight = clamp(rig.scale / 103, 5.4, 12.5) * glyphScale;
    cellWidth = cellHeight * 0.69;
    boneMask.width = Math.ceil(width / cellWidth);
    boneMask.height = Math.ceil(height / cellHeight);
    const context = p.drawingContext;
    context.font = '600 ' + cellHeight * 0.91 + 'px "Cascadia Mono", Consolas, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    fracture.resize(width, height, cartPosition(), Math.min(window.devicePixelRatio || 1, 1.5));
  }

  function drawAsciiSkeleton(context, bones, time) {
    const { width: columns, height: rows } = boneMask;
    maskContext.resetTransform();
    maskContext.clearRect(0, 0, columns, rows);
    maskContext.setTransform(1 / cellWidth, 0, 0, 1 / cellHeight, 0, 0);
    for (const bone of bones) paintBone(maskContext, bone);

    const pixels = maskContext.getImageData(0, 0, columns, rows).data;
    let lastTone = -1;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const cell = row * columns + column;
        const offset = cell * 4;
        const alpha = pixels[offset + 3];
        if (alpha < 62) continue;
        const cellSeed = hashCell(cell, asciiSeed);
        const grain = ((cellSeed >>> 18) & 255) / 255 - 0.5;
        const light = pixels[offset] / 255;
        const value = clamp((light * 0.85 + 0.14 + grain * 0.17) * (0.7 + 0.3 * alpha / 255), 0, 0.999);
        const tone = Math.floor(value * ink.length);
        const phase = Math.floor(time * (6 + (cellSeed & 7) * 0.78) + (cellSeed & 63) / 64);
        const group = glyphs[tone];
        if (tone !== lastTone) {
          context.fillStyle = ink[tone];
          lastTone = tone;
        }
        context.fillText(group[hashCell(cellSeed, phase) % group.length],
          (column + 0.5) * cellWidth, (row + 0.5) * cellHeight);
      }
    }
  }

  function setCatalog(products) {
    catalog = products.map((product, index) => ({ product, rank: hashCell(index, catalogSeed) }))
      .sort((a, b) => a.rank - b.rank)
      .map(({ product }) => product);
    if (lastNotificationUpdate === Infinity) lastNotificationUpdate = Math.max(950, p.millis() + 180);
  }

  function catalogStatus({ products, skipped }) {
    const label = products.length === 1 ? 'image' : 'images';
    return `${products.length} ${label} loaded${skipped ? ` · ${skipped} skipped` : ''}`;
  }

  async function loadProjectProducts() {
    try {
      const result = await productImages.loadFolder();
      if (result.products.length && !catalog.length) setCatalog(result.products);
      if (!importVersion) {
        productStatus.textContent = result.products.length
          ? catalogStatus(result) : 'Add images to the products folder or choose files here.';
      }
    } catch {
      if (!importVersion) productStatus.textContent = 'Product folder unavailable. Choose product images here.';
    }
  }

  async function importProducts() {
    const files = Array.from(productFiles.files);
    if (!files.length) return;
    const version = ++importVersion;
    productStatus.textContent = 'Reading product images…';
    const result = await productImages.readFiles(files, () => version === importVersion);
    if (version !== importVersion) return;
    productFiles.value = '';
    if (!result.products.length) {
      productStatus.textContent = 'Choose a readable image with visible pixels.';
      return;
    }
    setCatalog(result.products);
    productStatus.textContent = catalogStatus(result);
  }

  function cartPosition() {
    const bounds = cartIcon.getBoundingClientRect();
    const origin = stage.getBoundingClientRect();
    const left = bounds.left - origin.left;
    const top = bounds.top - origin.top;
    return { x: left + bounds.width * 0.58, y: top + bounds.height * 0.42 };
  }

  function setNotificationCount(count) {
    notificationCount = count;
    const visible = count > 0;
    const label = count === maxNotifications ? '99+' : String(count);
    cartBadge.textContent = label;
    cartBadge.hidden = !visible;
    cart.toggleAttribute('data-notification', visible);
    cart.setAttribute('aria-disabled', String(!visible));
    const noun = count === 1 ? 'notification' : 'notifications';
    cart.setAttribute('aria-label', visible ? `Shopping cart, ${label} new ${noun}` : 'Shopping cart');
  }

  function signalNotification() {
    cartGlow?.cancel();
    const radius = reducedMotion.matches ? 7 : 11;
    cartGlow = cartIcon.animate([
      { filter: 'drop-shadow(0 0 0 transparent)' },
      { filter: `drop-shadow(0 0 ${radius}px var(--ui-wash))`, offset: 0.17 },
      { filter: 'drop-shadow(0 0 0 transparent)' }
    ], { duration: 300, easing: 'ease-out' });
  }

  function updateNotifications(milliseconds) {
    if (milliseconds < lastNotificationUpdate) return;
    let arrivals = 0;
    let burstStart = lastNotificationUpdate;
    if (notificationArrivals < surgeThreshold) {
      const boost = nextProduct * notificationClickAdvance;
      const previousProgress = notificationProgress(lastNotificationUpdate + boost);
      const credit = notificationCredit + notificationProgress(milliseconds + boost) - previousProgress;
      const untilSurge = surgeThreshold - notificationArrivals;
      arrivals = Math.min(untilSurge, Math.floor(credit));
      if (arrivals === untilSurge) {
        // Start the surge at the 20th arrival, even when a frame spans the transition.
        burstStart = ageAtNotificationProgress(previousProgress + untilSurge - notificationCredit) - boost;
        notificationCredit = 0;
      } else {
        burstStart = milliseconds;
        notificationCredit = credit - arrivals;
      }
    }

    notificationCredit += Math.max(0, milliseconds - burstStart) / surgeInterval;
    const bursts = Math.floor(notificationCredit);
    notificationCredit -= bursts;
    // Group arrivals so the unread badge races ahead while the glow keeps its cadence.
    const burstSize = 3 + Math.min(2, Math.floor(nextProduct / 6));
    arrivals += bursts * burstSize;
    lastNotificationUpdate = milliseconds;
    if (!arrivals) return;
    const first = notificationArrivals === 0;
    notificationArrivals += arrivals;
    const count = Math.min(maxNotifications, notificationCount + arrivals);
    if (count === notificationCount) return;
    setNotificationCount(count);
    signalNotification();
    if (first) cartStatus.textContent = 'New shopping cart notification.';
    if (count === maxNotifications && !capAnnounced) {
      capAnnounced = true;
      cartStatus.textContent = 'Shopping cart has 99 or more notifications.';
    }
  }

  function beginClaim() {
    if (!notificationCount || !catalog.length) return;
    const milliseconds = p.millis();
    // Account for the elapsed time before this purchase advances the ramp.
    updateNotifications(milliseconds);
    setNotificationCount(notificationCount - 1);

    const order = nextProduct++;
    const slot = scanOrder[order % scanCount];
    const product = catalog[order % catalog.length];
    const replaced = Boolean(purchases[slot]);
    purchases[slot] = { product, order, at: milliseconds, seed: hashCell(order, windowSeed) };
    fracture.strike(milliseconds);
    claim = { started: claim?.release === 0 ? claim.started : milliseconds, release: 0 };
    const noun = notificationCount === 1 ? 'notification' : 'notifications';
    const count = Math.min(nextProduct, scanCount);
    const boxes = count === 1 ? 'box' : 'boxes';
    const change = replaced ? 'replaced the oldest box' : 'added to the arm';
    cartStatus.textContent = `${product.name} ${change}. ${count} ${boxes} on the arm. ${notificationCount} ${noun} remaining.`;
  }

  function updateCartPress(milliseconds, contact, animate) {
    if (!claim || claim.release) return;
    const distance = Math.hypot(tracked.x - contact.x, tracked.y - contact.y);
    if (distance > 8 && milliseconds - claim.started < 690) return;

    claim.release = milliseconds + (animate ? 225 : 128);
    press.until = milliseconds + 178;
  }

  function readPointer(event) {
    if (!event.isPrimary) return;
    const target = cart.contains(event.target) ? cartPosition() : { x: event.clientX, y: event.clientY };
    pointer.x = clamp(target.x, 0, p.width);
    pointer.y = clamp(target.y, 0, p.height);
    pointer.active = true;
  }

  function beginPress(event) {
    if (!event.isPrimary || event.button !== 0) return;
    readPointer(event);
    if (cart.contains(event.target) && (notificationCount || claim)) return;
    press.pointerId = event.pointerId;
    press.until = p.millis() + 128;
  }

  function releasePress(event) {
    if (event.pointerId === press.pointerId) press.pointerId = null;
  }

  function readKeys(event) {
    if (projectPanel?.open || event.target === projectTab || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code === 'Space') {
      if (cart.contains(event.target)) return;
      event.preventDefault();
      if (!press.space) press.until = p.millis() + 128;
      press.space = true;
      return;
    }
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = Math.max(14, rig.scale * 0.034);
    pointer.x = clamp((pointer.active ? pointer.x : tracked.x) + direction[0] * step, 0, p.width);
    pointer.y = clamp((pointer.active ? pointer.y : tracked.y) + direction[1] * step, 0, p.height);
    pointer.active = true;
  }

  p.setup = () => {
    p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = p.createCanvas(Math.max(1, stage.clientWidth), Math.max(1, stage.clientHeight));
    canvas.elt.classList.add('arm-canvas');
    canvas.elt.setAttribute('role', 'img');
    canvas.elt.setAttribute('aria-label', 'A moving ASCII skeleton arm with glitching product boxes added from the cart');
    configureCanvas(p.width, p.height);
    productFiles.addEventListener('change', importProducts);
    loadProjectProducts();
    tracked.x = rig.rest.x;
    tracked.y = rig.rest.y;
    stage.addEventListener('pointermove', readPointer);
    stage.addEventListener('pointerdown', beginPress);
    cart.addEventListener('click', beginClaim);
    window.addEventListener('pointerup', releasePress);
    window.addEventListener('pointercancel', releasePress);
    window.addEventListener('keydown', readKeys);
    window.addEventListener('keyup', (event) => {
      if (event.code === 'Space') press.space = false;
    });
    window.addEventListener('blur', () => {
      press.pointerId = null;
      press.space = false;
      press.until = 0;
    });
  };

  p.windowResized = () => {
    if (!rig) return;
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    if (width === p.width && height === p.height) return;

    tracked.x *= width / p.width;
    tracked.y *= height / p.height;
    pointer.x = clamp(pointer.x, 0, width);
    pointer.y = clamp(pointer.y, 0, height);
    p.resizeCanvas(width, height, true);
    configureCanvas(width, height);
  };

  p.draw = () => {
    const animate = !reducedMotion.matches;
    const milliseconds = p.millis();
    const time = milliseconds / 1000;
    if (claim?.release && milliseconds >= claim.release) claim = null;
    updateNotifications(milliseconds);
    fracture.draw(milliseconds, animate);
    const contact = cartPosition();
    const idle = animate && !pointer.active && !claim;
    const target = claim ? contact : pointer.active ? pointer : {
      x: rig.rest.x + (idle ? Math.sin(time * 0.62) * rig.scale * 0.008 : 0),
      y: rig.rest.y + (idle ? Math.cos(time * 0.81) * rig.scale * 0.009 : 0)
    };
    const dt = Math.min(p.deltaTime / 1000, 0.05);

    if (animate) {
      [tracked.x, tracked.vx] = followAxis(tracked.x, tracked.vx, target.x, dt);
      [tracked.y, tracked.vy] = followAxis(tracked.y, tracked.vy, target.y, dt);
    } else {
      Object.assign(tracked, { x: target.x, y: target.y, vx: 0, vy: 0 });
    }
    updateCartPress(milliseconds, contact, animate);
    const pressed = press.pointerId !== null || press.space || milliseconds < press.until;
    const pressure = pressed ? 1 : 0;
    if (animate) {
      [press.amount, press.velocity] = followAxis(press.amount, press.velocity, pressure, dt, pressed ? 32 : 17);
    } else {
      press.amount = pressure;
      press.velocity = 0;
    }

    const pose = solvePose(rig, {
      x: clamp(tracked.x, 0, p.width),
      y: clamp(tracked.y, 0, p.height)
    });
    const lateralSpeed = tracked.vy * Math.cos(pose.forearmAngle) - tracked.vx * Math.sin(pose.forearmAngle);
    const fingerFollow = animate ? pose.turnRoom * (-clamp(lateralSpeed / (rig.scale * 2.1), -0.68, 0.68) + Math.sin(time * 1.7) * 0.05) : 0;
    const context = p.drawingContext;
    context.clearRect(0, 0, p.width, p.height);
    const arm = projectArm(pose, rig, fingerFollow, clamp(press.amount, 0, 1));
    const windows = nextProduct ? activeWindows(poseContours(arm), purchases, milliseconds, animate, p.width, p.height) : [];
    drawConnections(context, windows, contact, p.height);
    drawAsciiSkeleton(context, arm.bones, animate ? time : 0);
    for (const window of windows) drawScanWindow(context, window);
  };
}, stage);
