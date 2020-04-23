import React from "react";
import AppWithRouterAccess from "./routes/Protected/AppWithRouterAccess";
import "semantic-ui-less/semantic.less";
function App() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <AppWithRouterAccess />
    </div>
  );
}

export default App;
