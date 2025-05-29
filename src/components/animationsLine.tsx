import { motion, SVGMotionProps, type MotionValue } from 'framer-motion';

interface IAnimationsLine extends SVGMotionProps<SVGPathElement> {
  top: string | number;
  left: string | number;
  transformationY1: MotionValue<number>;
  transformationY2: MotionValue<number>;
}

export const AnimationsLine = ({
  top,
  left,
  transformationY1,
  transformationY2,
  stroke,

  ...props
}: IAnimationsLine) => {
  return (
    <div
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
      className="w-screen h-screen max-w-[2200px] max-h-[2200px] absolute"
    >
      <svg
        viewBox="0 0 20 20"
        width="100vw"
        height="180vh"
        className="block"
        style={{
          maxWidth: '1900px',
          maxHeight: '1700px',
          minHeight: '200px',
          minWidth: '200px',
        }}
        aria-hidden="true"
      >
        <motion.path
          fill="none"
          stroke="#9091A0"
          strokeOpacity="0"
          strokeWidth="2"
          {...props}
        ></motion.path>
        <motion.path
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          className="motion-reduce:hidden"
          {...props}
        />

        <defs>
          <motion.linearGradient
            id={stroke}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1={transformationY1}
            y2={transformationY2}
          >
            <stop stopColor="#18CCFC" stopOpacity="0"></stop>
            <stop stopColor="#18CCFC"></stop>
            <stop offset="0.325" stopColor="#6344F5"></stop>
            <stop offset="1" stopColor="#AE48FF" stopOpacity="0"></stop>
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  );
};
