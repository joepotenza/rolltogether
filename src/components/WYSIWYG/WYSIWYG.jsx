/*
    WYSIWYG.jsx
    What You See Is What You Get
    TinyMCE Editor integration
*/
import { useState } from "react";
import ReactQuill from "react-quill-new";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";

function WYSIWYG({ initialContent = "", options = {}, onChange }) {
  const [value, setValue] = useState(initialContent);

  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", { list: "ordered" }, { list: "bullet" }],
    [{ align: [] }, { indent: "-1" }, { indent: "+1" }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }],

    ["link"],
  ];

  const handleChange = (html) => {
    setValue(html);
    onChange(DOMPurify.sanitize(html).replaceAll("&nbsp;", " "));
  };

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={handleChange}
      modules={{ toolbar: toolbarOptions }}
    />
  );
}
export default WYSIWYG;

/*

:::TinyMCE INTEGRATION BELOW::: (Requires API Key and potentially costs money depending on # of uses per month)

import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
const { VITE_TINYMCE_API_KEY } = import.meta.env;

function WYSIWYG({ initialContent = "", options = {}, onChange }) {
  const [content, setContent] = useState(initialContent);

  const handleEditorChange = (newContent) => {
    setContent(newContent);
    if (typeof onChange === "function") {
      onChange(newContent);
    }
  };

  const initOptions = {
    menubar: false,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "anchor",
      "searchreplace",
      "table",
      "preview",
    ],
    toolbar:
      "undo redo | blocks | " +
      "bold italic forecolor | alignleft aligncenter " +
      "alignright alignjustify table | bullist numlist outdent indent | " +
      "link | " +
      "removeformat",
    content_style:
      "body { font-family:'CabinetGrotesk',Helvetica,Arial,sans-serif; font-size:14px }",
    ...options,
  };

  return (
    <Editor
      apiKey={VITE_TINYMCE_API_KEY}
      onEditorChange={handleEditorChange}
      value={content}
      init={initOptions}
    />
  );
}
export default WYSIWYG;
*/
