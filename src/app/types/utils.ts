// Props interfaces for components
interface NetworksProps {
    networkName: string;
    setNetworkName: (name: string) => void;
    notifyError: (msg: string) => void;
    notifySuccess: (msg: string) => void;
  }
  
  interface TradingProps {
    axios: any;
    trading: any[];
    tradingCount: number;
    length: number;
    setTradingCount: (count: number) => void;
    setActiveComponent: (component: string) => void;
    notifyError: (msg: string) => void;
    notifySuccess: (msg: string) => void;
  }
  
  interface PriceProps {
    buyMemberShip: (memberType: string, price: number) => void;
    setMembershipType: (type: string) => void;
  }
  
  interface AuthProps {
    setActiveComponent: (component: string) => void;
    axios: any;
    notifyError: (msg: string) => void;
    notifySuccess: (msg: string) => void;
  }
  