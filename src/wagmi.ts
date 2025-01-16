import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  arbitrum,
  arbitrumSepolia,
  arbitrumGoerli,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "f8a6524307e28135845a9fe5811fcaa2",
  chains: [mainnet, arbitrum, arbitrumSepolia, arbitrumGoerli],
  ssr: true,
});
