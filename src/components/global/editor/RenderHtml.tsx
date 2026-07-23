import React from "react";
import parser from "html-react-parser";

const RenderHtml = ({ text }: { text: string }) => {
  return <div className="html_render text-black">{parser(text || "")}</div>;
};

export default RenderHtml;
