import { LazyMotion } from "framer-motion";

const loadFeatures = () => import("../utils/motionFeatures.js").then((module) => module.default);

export default function MotionProvider({ children }) {
  return <LazyMotion features={loadFeatures} strict>{children}</LazyMotion>;
}