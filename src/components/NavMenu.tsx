import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MdCenterFocusWeak,
  MdDashboardCustomize,
  MdLaptopChromebook,
  MdPhoneAndroid,
  MdSettings,
} from "react-icons/md";

const currentPageColor = "bg-emerald-900";

const NavMenuItem: React.FC<{
  path: string;
  title: string;
  currentLoc: string;
  itemIcon: JSX.Element;
  itemEndIcon?: JSX.Element;
}> = ({ path, title, currentLoc, itemIcon, itemEndIcon }) => {
  const i = <MdDashboardCustomize />;
  return (
    <li>
      <Link
        href={path}
        className={`${
          currentLoc.endsWith(path) ? currentPageColor : ""
        } flex items-center rounded-lg p-2  hover:bg-blue-500 `}
      >
        {itemIcon}
        <span className="ml-3 flex-1 whitespace-nowrap">{title}</span>
        {itemEndIcon}
      </Link>
    </li>
  );
};

const NavMenu: React.FC = () => {
  const [currentLoc, setCurrentLoc] = useState("");
  useEffect(() => {
    if (window.location.href !== currentLoc) {
      setCurrentLoc(window.location.href);
      console.log("New location: ", window.location.href);
    }
  });

  return (
    <aside
      id="logo-sidebar"
      className="fixed left-0 top-0 z-40 h-screen w-52 -translate-x-full  bg-transparent pt-20 transition-transform sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full overflow-y-auto bg-transparent px-3 pb-4">
        <ul className="space-y-2 font-medium text-slate-100">
          <NavMenuItem
            path="/"
            itemIcon={<MdDashboardCustomize />}
            title="Home"
            currentLoc={currentLoc}
          />

          <NavMenuItem
            path="/brokenAppsView"
            itemIcon={<MdPhoneAndroid />}
            title="Broken Apps"
            currentLoc={currentLoc}
          />

          <NavMenuItem
            path="/top250"
            itemIcon={<MdPhoneAndroid />}
            title="Top 250"
            currentLoc={currentLoc}
          />
          <NavMenuItem
            path="/amace"
            itemIcon={<MdPhoneAndroid />}
            itemEndIcon={
              <span className="ml-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Mobile
              </span>
            }
            title="Amac-E"
            currentLoc={currentLoc}
          />
          <NavMenuItem
            path="/manageRuns"
            itemIcon={<MdCenterFocusWeak />}
            itemEndIcon={
              <span className="ml-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Mobile
              </span>
            }
            title="Manage"
            currentLoc={currentLoc}
          />
          <NavMenuItem
            path="/enterprise"
            itemIcon={<MdLaptopChromebook />}
            itemEndIcon={
              <span className="ml-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Web
              </span>
            }
            title="Enterprise"
            currentLoc={currentLoc}
          />
          <NavMenuItem
            path="/settings"
            itemIcon={<MdSettings />}
            title="Settings"
            currentLoc={currentLoc}
          />
        </ul>
      </div>
    </aside>
  );
};
export default NavMenu;
