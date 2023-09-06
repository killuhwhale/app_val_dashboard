const GoogleIcon = (key: string) => {
  return (
    <img
      key={key}
      className="mr-2 h-[20px]"
      src="images/search.png"
      alt="Google Icon"
    />
  );
};
const FacebookIcon = (key: string) => {
  return (
    <img
      key={key}
      className="mr-2 h-[20px]"
      src="images/facebook.png"
      alt="Facebook Icon"
    />
  );
};
const EmailIcon = (key: string) => {
  return (
    <img
      key={key}
      className="mr-2 h-[20px]"
      src="images/gmail.png"
      alt="Email Icon"
    />
  );
};

const PlaceholderIcon = (key: string) => {
  return (
    <img
      key={key}
      className="mr-2 h-[20px]"
      src="images/tilde.png"
      alt="Email Icon"
    />
  );
};

function decodeLoginResults(lr: number): number[] {
  // login results = [0001] => 4 bit number where bits 1-3 represent if the app logged in via Google, Facebook or Email successfully

  if (!lr) {
    return [];
  }
  // console.log(`LR:  ${lr} - ${lr.toString(2)}`);

  const labels = lr
    .toString(2) // binary string
    .split("") // separate bits
    .reverse() // Reverse order
    .slice(0, -1) // Remove highest bit since this acts as a placeholder to capture 0's
    .map((num) => parseInt(num)); // Turn bit to int
  return labels;
}

const sortLoginResult = (lr: number) => {
  if (!lr) {
    return "";
  }

  // console.log(`LR:  ${lr} - ${lr.toString(2)}`);

  return lr.toString(2);
};

export {
  GoogleIcon,
  FacebookIcon,
  EmailIcon,
  PlaceholderIcon,
  decodeLoginResults,
  sortLoginResult,
};
