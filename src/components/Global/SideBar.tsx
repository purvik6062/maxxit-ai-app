"use client";
import React, { useState } from "react";

interface MenuItem {
  menu: string;
  icon: string;
}

interface SideBarComponentProps {
  array: MenuItem[];
  title: string;
  setActive: (menu: string) => void;
  active: string;
  setActiveComponent: (menu: string) => void;
}

interface SideBarProps {
  setActiveComponent: (menu: string) => void;
}

const SideBarComponent: React.FC<SideBarComponentProps> = ({
  array,
  title,
  setActive,
  active,
  setActiveComponent,
}) => (
  <div className="nav_group">
    <h2 className="group__title">{title}</h2>
    <ul className="group__list hover:cursor-pointer">
      {array.map((menu, index) => (
        <li key={index} onClick={() => setActiveComponent(menu.menu)}>
          <a
            onClick={() => setActive(menu.menu)}
            className={`fn__tooltip ${
              active === menu.menu ? "active" : ""
            } menu__item`}
            data-position="right"
            title={menu.menu}
          >
            <span className="icon">
              <img src={menu.icon} className="fn__svg" alt="" />
            </span>
            <span className="text">{menu.menu}</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const SideBar: React.FC<SideBarProps> = ({ setActiveComponent }) => {
  const [active, setActive] = useState<string>("Home");

  const array1: MenuItem[] = [
    {
      menu: "Home",
      icon: "img/lighticon/light-14.png",
    },
    {
      menu: "Impact Leaderboard",
      icon: "img/lighticon/light-17.png",
    },
    {
      menu: "Heartbeat Dashboard",
      icon: "img/lighticon/light-7.png",
    },
  ];

  const array2: MenuItem[] = [
    {
      menu: "Profile",
      icon: "img/lighticon/light-4.png",
    },
  ];

  return (
    <div className="techwave_fn_leftpanel">
      <div className="mobile_extra_closer"></div>
      <div className="leftpanel_logo">
        <a className="fn_logo">
          <span className="full_logo">
            <img src="img/new_name_logo.svg" className="desktop_logo" alt="" />
            {/* above is the logo of cryptobot for big screen  */}
            <img src="img/new_name_logo.svg" className="retina_logo" alt="" />
            {/* above is the logo of cryptobot for small screen */}
          </span>
          <span className="short_logo">
            <img
              src="/img/new_logo.svg"
              className="desktop_logo"
              alt=""
            />
            {/* the above logo is the logo of T for the big screen */}
            <img
              src="/img/new_logo.svg"
              className="retina_logo w-[45px] h-[40px]"
              alt=""
            />
            {/* the above logo is the logo of T for the smaller screen */}
          </span>
        </a>
        <a href="#" className="fn__closer fn__icon_button desktop_closer">
          <img src="img/lighticon/light-22.png" alt="" className="fn__svg" />
        </a>
        <a href="#" className="fn__closer fn__icon_button mobile_closer">
          <img src="img/lighticon/light-22.png" alt="" className="fn__svg" />
        </a>
      </div>

      <div className="leftpanel_content">
        <SideBarComponent
          setActiveComponent={setActiveComponent}
          setActive={setActive}
          active={active}
          array={array1}
          title="Start Here"
        />
        <SideBarComponent
          setActiveComponent={setActiveComponent}
          setActive={setActive}
          active={active}
          array={array2}
          title="User Tools"
        />
      </div>
    </div>
  );
};

export default SideBar;
