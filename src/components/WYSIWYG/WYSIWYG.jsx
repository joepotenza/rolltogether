/*
    WYSIWYG.jsx
    What You See Is What You Get
    TinyMCE Editor integration
*/
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
      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
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
