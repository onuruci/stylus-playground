import React from 'react';
import { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';


const Editor = ({file, handleCodeChange}) => {
  const options = {
    selectOnLineNumbers: false,
  };


  return(
    <div>
       <MonacoEditor
          width="1200"
          height="700"
          language="rust"
          theme="vs-dark"
          value={file.content}
          options={options}
          onChange={e => handleCodeChange(e)}
      />
    </div>
  );
}

export default Editor;