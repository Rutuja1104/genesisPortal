import React, { useState, useEffect, useContext } from "react";
import { Collapse } from "reactstrap";
import { Link } from "react-router-dom";
import NavData from "../LayoutMenuData";
import { HiMinusSm, HiChevronDown } from "react-icons/hi";
import AllowedUsersOnly from "../../libs/wrappers/AllowedUsersOnly";
import { globalContext } from "../../global-context/GlobalContext";

const VerticalLayout = (props) => {
  const [openItems, setOpenItems] = useState([]);
  const context=useContext(globalContext);
  const {activeTab}=context;

  useEffect(() => {
    const adminIndex = navData.findIndex(
      (item) => item.label === "Administration"
    );
    if (adminIndex !== -1) {
      setOpenItems([adminIndex]);
    }
  }, []);

  const toggleItem = (key) => {
    if (openItems.includes(key)) {
      setOpenItems(openItems.filter((item) => item !== key));
    } else {
      setOpenItems([...openItems, key]);
    }
  };

  const navData = NavData().props.children;

  return (
    <React.Fragment>
      {(navData || []).map((item, key) => {
        return (
          <AllowedUsersOnly allowedRoles={item.roles} key={key}>
            {item["isHeader"] ? (
              <li className="menu-title">
                <span data-key="t-menu">{item.label} </span>
              </li>
            ) : (
              <li className={item?.id===activeTab?'nav-item selectedTab':'nav-item'} onClick={()=>item?.click()}>
                {item.subItems ? (
                  <Link
                    onClick={() => toggleItem(key)}
                    className="nav-link menu-link"
                    to={item.link}
                    data-bs-toggle="collapse"
                  >
                    <div>{item.icon}</div>
                    <span data-key="t-apps" className="ms-2">
                      {item.label}
                    </span>
                    {item.subItems && (
                      <HiChevronDown className="arrow-logo float-right" />
                    )}
                  </Link>
                ) : (
                  <Link className="nav-link menu-link" to={item.link}>
                    <div>{item.icon}</div>
                    <span data-key="t-apps" className="ms-2">
                      {item.label}
                    </span>
                  </Link>
                )}
                {item.subItems && (
                  <Collapse
                    className="menu-dropdown"
                    id="sidebarApps"
                    isOpen={openItems.includes(key)}
                  >
                    <ul className="nav nav-sm flex-column">
                      {item.subItems.map((subItem, subKey) => (
                        <AllowedUsersOnly
                          allowedRoles={subItem.roles}
                          key={subKey}
                        >
                          <React.Fragment key={subKey}>
                            {!subItem.isChildItem ? (
                              <li className="nav-item">
                                <Link
                                  to={subItem.link ? subItem.link : "/#"}
                                  className="nav-link"
                                >
                                  <HiMinusSm className="label-class" />
                                  <span className="ms-3 label-class ">
                                    {subItem.label}
                                  </span>
                                </Link>
                              </li>
                            ) : (
                              <li className="nav-item">
                                <Link
                                  onClick={() => toggleItem(`${key}-${subKey}`)}
                                  className="nav-link  "
                                  to="/#"
                                  data-bs-toggle="collapse"
                                >
                                  {" "}
                                  {props.t(subItem.label)}
                                </Link>
                                <Collapse
                                  isOpen={openItems.includes(
                                    `${key}-${subKey}`
                                  )}
                                >
                                  <AllowedUsersOnly
                                    allowedRoles={openItems?.roles}
                                    key={subKey}
                                  >
                                    <ul className="nav nav-sm flex-column">
                                      {/* child subItems  */}
                                      {subItem.childItems &&
                                        console.log(
                                          "subItem.childItems",
                                          subItem.childItems
                                        ) &&
                                        subItem.childItems.map(
                                          (childItem, childKey) => (
                                            <li
                                              className="nav-item "
                                              key={childKey}
                                            >
                                              <Link
                                                to={
                                                  childItem.link
                                                    ? childItem.link
                                                    : "/#"
                                                }
                                                className="nav-link"
                                              >
                                                {childItem.label}
                                              </Link>
                                            </li>
                                          )
                                        )}
                                    </ul>
                                  </AllowedUsersOnly>
                                </Collapse>
                              </li>
                            )}
                          </React.Fragment>
                        </AllowedUsersOnly>
                      ))}
                    </ul>
                  </Collapse>
                )}
              </li>
            )}
          </AllowedUsersOnly>
        );
      })}
    </React.Fragment>
  );
};

export default VerticalLayout;
