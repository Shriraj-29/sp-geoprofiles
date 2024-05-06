import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation, {
  activeTabRef,
} from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import UserPostCard from "../components/user-post.component";

const HomePage = () => {
  let [users, setUser] = useState(null);

  const fetchLatestUsers = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-users")
      .then(({ data: { users } }) => {
        setUser(users);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    activeTabRef.current.click();

    fetchLatestUsers({ page: 1 });
  }, []);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation routes={["Home"]}>
            <div className="w-full">
              {users == null ? (
                <Loader />
              ) : (
                users.map((user, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <UserPostCard
                        address={user.address}
                        user={user.personal_info}
                        joinedAt={user.joinedAt}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
            </div>
          </InPageNavigation>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
