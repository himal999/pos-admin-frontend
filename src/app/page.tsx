import Login from "./auth/login/page";

export const metadata = {
  title: "AVENTA POS",
  description: "Developed By Tineth Pathirage",
  icons: {
    icon: "/admin/images/logo/icon.png",
  },
};

export default function Page() {
  return <Login />;
}
