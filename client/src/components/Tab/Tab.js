const Tab = ({name, index, selected, handleTabChange}) => {
  return(
    <div onClick={() => handleTabChange(index)} className={`border-2 w-32 border-indigo-700 cursor-pointer ${selected && "bg-indigo-700 text-white"}`}>
      {name}
    </div>
  );
}

export default Tab;