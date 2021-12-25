import { PlayerAward } from "../utils/interfaces";
import { RiVipCrownFill } from "react-icons/ri";
import { AiFillBug } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
export default function AwardDisplayer(props: {
  awards?: PlayerAward[];
  useBrackets?: boolean;
  keyId: string;
}) {
  if (!props.awards || props.awards.length === 0) return null;

  let returnArray: JSX.Element[] = [];
  let sorted = [...props.awards].sort((a, b) => a.award.id - b.award.id);
  const openBracket = props.useBrackets ? "[" : null;
  const closeBracket = props.useBrackets ? "]" : null;
  const style = { margin: 0, padding: 0, display: "inline-block" };
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    switch (item.award.name) {
      case "Winner":
        returnArray.push(
          <div
            style={style}
            key={
              String(item.award.name) +
              item.player?.id +
              "scoreboard" +
              props.keyId
            }
          >
            {openBracket}
            <RiVipCrownFill color={item.award.color} /> {item.amount}
            {closeBracket}
          </div>
        );
        break;
      case "Beta player":
        returnArray.push(
          <div
            style={style}
            key={
              String(item.award.name) +
              item.player?.id +
              "scoreboard" +
              props.keyId
            }
          >
            {openBracket}
            <AiFillBug color={item.award.color} />
            {closeBracket}
          </div>
        );
        break;
      case "Verified":
        returnArray.push(
          <div
            style={style}
            key={
              String(item.award.name) +
              item.player?.id +
              "scoreboard" +
              props.keyId
            }
          >
            {openBracket}
            <MdVerified color={item.award.color} />
            {closeBracket}
          </div>
        );
        break;
    }
  }

  return <>{returnArray.map((a) => a)}</>;
}
