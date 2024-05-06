import { Link } from "react-router-dom";
import { getFullDay } from "../common/date";

const AboutUser = ({ className, desc, social_links, joinedAt }) => {
  return (
    <div className={`md:w-[90%] md:mt-7 ${className}`}>
      <p className="text-xl leading-7">
        {desc.length ? desc : "Nothing to read here"}
      </p>

      <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
        {Object.entries(social_links).map(([key, link]) => {
          return link ? (
            <Link
              to={link}
              key={key}
              target="_blank"
              aria-label="Social Media Link"
            >
              <i
                className={`fi ${
                  key != "website" ? `fi-brands-${key}` : "fi-rr-globe"
                } text-2xl hover:text-black`}
              ></i>
            </Link>
          ) : (
            " "
          );
        })}
      </div>

      <p className="text-xl leading-7 text-dar-grey">
        Joined on {getFullDay(joinedAt)}
      </p>
    </div>
  );
};

export default AboutUser;
