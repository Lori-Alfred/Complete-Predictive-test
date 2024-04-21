import styles from "./WelcomePage.module.scss";

const WelcomePage = () => {
  return (
    <div className={styles.welcomePageContainer}>
      <h1>
        Welcome to James Chase <br /> in partnership with <br /> DragonFly
      </h1>
    </div>
  );
};

export default WelcomePage;
