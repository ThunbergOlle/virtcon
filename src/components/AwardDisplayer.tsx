import { PlayerAward } from "../utils/interfaces";
import { RiVipCrownFill } from "react-icons/ri";
import { AiFillBug } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
export default function AwardDisplayer(props: {
  awards?: PlayerAward[];
  useBrackets?: boolean;
}) {
  if (!props.awards || props.awards.length === 0) return null;

  let returnArray: JSX.Element[] = [];
  let sorted = [...props.awards].sort((a, b) => a.award.id - b.award.id);
  const openBracket = props.useBrackets ? "[" : null;
  const closeBracket = props.useBrackets ? "]" : null;
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    switch (item.award.name) {
      case "Winner":
        returnArray.push(
          <>
            {openBracket}
            <RiVipCrownFill color={item.award.color} /> {item.amount}
            {closeBracket}
          </>
        );
        break;
      case "Beta player":
        returnArray.push(
          <>
            {openBracket}
            <AiFillBug color={item.award.color} />
            {closeBracket}
          </>
        );
        break;
      case "Verified":
        returnArray.push(
          <>
            {openBracket}
            <MdVerified color={item.award.color} />
            {closeBracket}
          </>
        );
        break;
    }
  }

  return <>{returnArray.map((a) => a)}</>;
}
