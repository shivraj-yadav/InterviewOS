import React from "react";
import toast from "react-hot-toast";

function HomePage() {
  return (
    <>
      <h1>kjs,mbk</h1>
      <button onClick={() => toast.success("Testing Toast")}>Click Me</button>
    </>
  );
}

export default HomePage;
