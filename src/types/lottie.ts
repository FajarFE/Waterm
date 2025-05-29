interface LottieAsset {
  id?: string;
  layers?: LottieLayer[];
  w?: number;
  h?: number;
  p?: string;
  u?: string;
  img?: unknown;
}

interface LottieTransform {
  p?: {
    k:
      | number[]
      | (
          | {
              o: { x: number; y: number };
              i: { x: number; y: number };
              s: number[];
              t: number;
            }
          | { s: number[]; t: number; o?: undefined; i?: undefined }
        )[];
  };
  a?: { k: number[] };
  s?: {
    k:
      | number[]
      | (
          | {
              i: { x: number[]; y: number[] };
              o: { x: number[]; y: number[] };
              t: number;
              s: number[];
            }
          | { t: number; s: number[]; i?: undefined; o?: undefined }
        )[];
  };
  r?: {
    k:
      | number
      | (
          | {
              o: { x: number; y: number };
              i: { x: number; y: number };
              s: number[];
              t: number;
            }
          | { s: number[]; t: number; o?: undefined; i?: undefined }
        )[];
  };
  o?: { k: number };
}

interface LottieShape {
  ty: string;
  d?: number;
  p?: unknown;
  s?: unknown;
  r?: unknown;
  nm?: string;
  mn?: string;
  hd?: boolean;
  ks?: LottieTransform;
}

interface LottieLayer {
  ddd?: number;
  ind?: number;
  ty?: number;
  nm?: string;
  sr?: number;
  ks?: LottieTransform;
  ao?: number;
  ip?: number;
  op?: number;
  st?: number;
  bm?: number;
  shapes?: LottieShape[];
  hasMask?: boolean;
  masksProperties?: unknown[];
  ef?: unknown[];
}

export interface LottieJsonType {
  v: string;
  meta: {
    g: string;
    a?: string;
    k?: string;
    d?: string;
    tc?: string;
  };
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: LottieAsset[];
  layers: LottieLayer[];
}

export interface LottieAnimationData {
  animationData: LottieJsonType;
  loop?: boolean;
}
