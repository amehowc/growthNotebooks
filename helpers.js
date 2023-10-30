export function scaleTo(
  originWidth,
  originHeight,
  destinationWidth,
  destinationHeight,
  cover = false
) {
  const widthRatio = destinationWidth / originWidth;
  const heightRatio = destinationHeight / originHeight;
  if (cover) {
    return Math.max(widthRatio, heightRatio);
  } else {
    return Math.min(widthRatio, heightRatio);
  }
}

export const createUniforms = (shader, config) => {
  for (const uniform in config) {
    shader.setUniform(uniform, config[uniform]);
  }
};


export function calculateArea(points) {
  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  area /= 2;
  return Math.abs(area);
}