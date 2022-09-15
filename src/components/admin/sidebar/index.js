import React, { Component } from "react";

import { Link, NavLink } from "react-router-dom";
import "../../../js/js/scripts";
import "../../../js/js/stisla";
import axios from "axios";
import { getUser, handleCookie } from "../../../api/Users";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { AuthLogout } from "../../../api/Auth";

// import SidebarGlobal from "../../../js/SidebarGlobal";

class SideBar extends Component {

  constructor(props){
    super(props);
    this.state = {
      Data : [],
      menuOpen : null
    }
  }

  toggleHandle = (key) => {
    this.setState({ menuOpen : this.state.menuOpen == key ? null : key });
  }

  logout = (userId) => {
    AuthLogout(userId);
    window.location.href="/";
  }

  async componentDidMount() {
      const user = await getUser(Cookies.get('userId'));
      if(user.newToken.is_error == true){
        if(user.newToken.message == 'Bearer token kosong' 
            || user.newToken.message == 'User not found'
            || user.newToken.message == 'Error has occured') 
            window.location.href="/";
            Object.keys(Cookies.get()).forEach(function(cookieName) {
              var neededAttributes = {

              };
              Cookies.remove(cookieName, neededAttributes);
            });
      }
      const decode = jwt_decode(user.newToken.data.access_token);
      if(user.userData.is_error == true){
        if(user.userData.message == 'User tidak ada'){
          window.location.reload();
        }
      }
      const userData = user.userData.data;
      await handleCookie(decode.userId, decode.name, decode.email, decode.roles);
      axios.defaults.withCredentials = true;
      const rolesResponse = await axios.post('http://localhost:3001/roles', {
          roles : userData.role.roles
      }, {
          headers : {
              'Authorization' : `Bearer ${user.newToken.data.access_token}`
          }
      });
      let sidebarMenu = [];
      var sidebar = rolesResponse.data.data;
      sidebar.forEach((item, index) => {
          let data = {
              menuId : sidebar[index].modul.id,
              dropdown : sidebar[index].modul.is_parent == 'Y' ? true : false,
              name : sidebar[index].modul.modul_name,
              icon : sidebar[index].modul.modul_icon,
          }
          if(sidebar[index].modul.menus.length > 0){
              Object.assign(data, { children : [] });
              sidebar[index].modul.menus.forEach((itemMenus, indexMenus) => {
                  let children = {
                      name : sidebar[index].modul.menus[indexMenus].menu_name,
                      url : sidebar[index].modul.menus[indexMenus].menu_url
                  }
                  data.children.push(children);
              });
          }else{
            Object.assign(data, {
              url : sidebar[index].modul.modul_url,
            });
          }
          sidebarMenu.push(data);
      });
      this.setState({ Data : sidebarMenu });
  }

  render () {
    return (
      <div className="main-sidebar">
        <aside id="sidebar-wrapper">
          <div className="sidebar-brand">
            <Link to="/"> AMT LMS </Link>{" "}
          </div>{" "}
          <div className="sidebar-brand sidebar-brand-sm">
            <Link to="/"> AMT </Link>{" "}
          </div>{" "}
          <ul className="sidebar-menu mb-5">
            {" "}
            {this.state.Data.map((menu, iMenu) => {
              let comp;
              if (menu.header) {
                comp = (
                  <li key={iMenu} className="menu-header">
                    {" "}
                    {menu.name}{" "}
                  </li>
                );
              } else if (menu.dropdown) {
                if (menu.active) {
                  comp = (
                    <li key={iMenu} className="nav-item dropdown active">
                      <a href="#" className="nav-link has-dropdown">
                        <i className={menu.icon} /> <span> {menu.name} </span>
                      </a>{" "}
                      <ul className="dropdown-menu">
                        {" "}
                        {menu.children.map((submenu, iSubmenu) => {
                          let subComp;
                          if (submenu.active) {
                            if (submenu.beep) {
                              subComp = (
                                <li key={iSubmenu} className="active">
                                  <NavLink
                                    activeStyle={{
                                      color: " #6777ef",
                                      fontWeight: "600",
                                    }}
                                    exact
                                    className="beep beep-sidebar"
                                    to={submenu.url}
                                  >
                                    {" "}
                                    {submenu.name}{" "}
                                  </NavLink>{" "}
                                </li>
                              );
                            } else {
                              subComp = (
                                <li key={iSubmenu}>
                                  <NavLink
                                    activeStyle={{
                                      color: " #6777ef",
                                      fontWeight: "600",
                                    }}
                                    exact
                                    to={submenu.url}
                                  >
                                    {" "}
                                    {submenu.name}{" "}
                                  </NavLink>{" "}
                                </li>
                              );
                            }
                          } else if (submenu.beep) {
                            subComp = (
                              <li key={iSubmenu}>
                                <NavLink
                                  activeStyle={{
                                    color: " #6777ef",
                                    fontWeight: "600",
                                  }}
                                  exact
                                  className="beep beep-sidebar"
                                  to={submenu.url}
                                >
                                  {" "}
                                  {submenu.name}{" "}
                                </NavLink>{" "}
                              </li>
                            );
                          } else {
                            subComp = (
                              <li key={iSubmenu}>
                                <NavLink
                                  activeStyle={{
                                    color: " #6777ef",
                                    fontWeight: "600",
                                  }}
                                  exact
                                  to={submenu.url}
                                >
                                  {" "}
                                  {submenu.name}{" "}
                                </NavLink>{" "}
                              </li>
                            );
                          }
  
                          return subComp;
                        })}{" "}
                      </ul>{" "}
                    </li>
                  );
                } else {
                  comp = (
                    <li key={iMenu} className={`nav-item dropdown${ this.state.menuOpen === menu.menuId ? ' active' : '' }`}>
                      <a href="#" className="nav-link has-dropdown" onClick={() => this.toggleHandle(menu.menuId) }>
                        <i className={menu.icon} /> <span> {menu.name} </span>
                      </a>{" "}
                      <ul className={`dropdown-menu${this.state.menuOpen === menu.menuId ? ' show' : ''}`}>
                        {" "}
                        {menu.children.map((submenu, iSubmenu) => {
                          let subComp;
                          if (submenu.active) {
                            if (submenu.beep) {
                              subComp = (
                                <li key={iSubmenu} className="active">
                                  <NavLink
                                    activeStyle={{
                                      color: " #6777ef",
                                      fontWeight: "600",
                                    }}
                                    exact
                                    className="beep beep-sidebar"
                                    to={submenu.url}
                                  >
                                    {" "}
                                    {submenu.name}{" "}
                                  </NavLink>{" "}
                                </li>
                              );
                            } else {
                              subComp = (
                                <li key={iSubmenu} className="active">
                                  <NavLink
                                    activeStyle={{
                                      color: " #6777ef",
                                      fontWeight: "600",
                                    }}
                                    exact
                                    to={submenu.url}
                                  >
                                    {" "}
                                    {submenu.name}{" "}
                                  </NavLink>{" "}
                                </li>
                              );
                            }
                          } else if (submenu.beep) {
                            subComp = (
                              <li key={iSubmenu}>
                                <NavLink
                                  activeStyle={{
                                    color: " #6777ef",
                                    fontWeight: "600",
                                  }}
                                  exact
                                  className="beep beep-sidebar"
                                  to={submenu.url}
                                >
                                  {" "}
                                  {submenu.name}{" "}
                                </NavLink>{" "}
                              </li>
                            );
                          } else {
                            subComp = (
                              <li key={iSubmenu}>
                                <NavLink
                                  activeStyle={{
                                    color: " #6777ef",
                                    fontWeight: "600",
                                  }}
                                  exact
                                  to={submenu.url}
                                >
                                  {" "}
                                  {submenu.name}{" "}
                                </NavLink>{" "}
                              </li>
                            );
                          }
  
                          return subComp;
                        })}{" "}
                      </ul>{" "}
                    </li>
                  );
                }
              } else if (menu.active) {
                //
                comp = (
                  <li key={iMenu} className="s">
                    <NavLink
                      activeStyle={{
                        color: " #6777ef",
                        fontWeight: "600",
                      }}
                      exact
                      to={menu.url}
                    >
                      <i className={menu.icon} /> <span> {menu.name} </span>
                    </NavLink>{" "}
                  </li>
                );
              } else {
                //Single Component
                comp = (
                  <li key={iMenu}>
                    <NavLink
                      activeStyle={{
                        color: " #6777ef",
                        fontWeight: "600",
                      }}
                      exact
                      to={menu.url}
                      onClick={() => menu.name == 'Logout' ? this.logout(Cookies.get('userId')) : this.toggleHandle(null)}
                    >
                      <i className={menu.icon} /> <span> {menu.name} </span>
                    </NavLink>{" "}
                  </li>
                );
              }
  
              return comp;
            })}{" "}
          </ul>{" "}
        </aside>{" "}
      </div>
    );
  }
}

export default SideBar;
