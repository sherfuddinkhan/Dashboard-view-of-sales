import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  return (
    <div style={styles.layout}>

      {/* LEFT SIDEBAR */}

      <div style={styles.sidebar}>
        <Sidebar />
      </div>

      {/* RIGHT CONTENT */}

      <div style={styles.content}>
        <Outlet />
      </div>

    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
  },

  sidebar: {
    width: "260px",
    minWidth: "260px",
    background: "#1f2937",
  },

  content: {
    flex: 1,
    minWidth: 0,
    background: "#f4f6f9",
  },
};

export default AppLayout;