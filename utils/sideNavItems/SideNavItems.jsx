import { DarkMode } from "../../icons/darkMode";
import { Market } from "../../icons/market";
import { Mint } from "../../icons/mint";
import { MyPortfolio } from "../../icons/myPortfolio";
import { Settings } from "../../icons/settings";
import { TokenEarnings } from "../../icons/tokenEarnings";
import { Dashboard } from '../../icons/dashboard'

export const sideNavItems = {
  menuItems: [
    {
      items: [
        {
          secondTitle: "Dashboard",
          link: "/",
        },
        {
          title: "Market",
          icon: <Market />,
          link: "/market",
        },
      ],
    },
    {
      items: [
        { secondTitle: "Profile", link: "/" },
        {
          title: "My Knights",
          icon: <MyPortfolio className="fill-gray-500 hover:fill-white" />,
          link: "/",
        },
        {
          title: "Earn Gold",
          icon: <TokenEarnings className="fill-gray-500 hover:fill-white" />,
          link: "/earn-gold",
        },
        {
          title: "History",
          icon: <Dashboard className="fill-gray-500 hover:fill-white" />,
          link: "/state",
        },
        {
          title: "Settings",
          icon: <Settings className="fill-gray-500 hover:fill-white" />,
          link: "/",
          commingsoon: true,
        },
      ],
    },
    {
      items: [
        { secondTitle: "Other" },
        {
          title: "Light Mode",
          icon: <DarkMode className="fill-gray-500 hover:fill-white" />,
          link: "/",
        },
      ],
    },
  ],
};
