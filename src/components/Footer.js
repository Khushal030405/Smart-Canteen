import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      &copy; {new Date().getFullYear()} SmartCanteen. All rights reserved.
    </footer>
  );
}
