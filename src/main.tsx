// Import libraries
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./state/store";
import 'react-toastify/dist/ReactToastify.css';

// Import component
import App from "./App";

// Import css
import "./style/tailwind.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
