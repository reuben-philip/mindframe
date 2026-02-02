import Image from "next/image";

function MyButton({title}: {title:string}){
  return (
    <button>{title}</button>
  );
}

export default function myapp() {
  return (
    <div> 
      <h1> MindFrame</h1>
      <MyButton title = "Get Started"/>

    </div>
  );
}
