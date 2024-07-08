import React from "react";

const SearchBox = React.forwardRef<HTMLInputElement>((props, ref) => {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search"
        className="w-full h-10 px-4 bg-rose-100 rounded-md border border-rose-300 shadow focus:outline-none focus:ring-0 "
        ref={ref}
        {...props} // Spread the remaining props to the input element
      />
      {/* <button className="w-1/12 h-8 bg-rose-500 text-white rounded-md">Search</button> */}
    </div>
  );
});
export default SearchBox;
