import css from "./App.module.scss";
import tools from "./data";

export default function App() {
  return (
    <div className={css.container}>
      <div className="flex h-72 w-72 animate-bounce flex-col justify-center rounded border border-dashed border-indigo-400 p-4 shadow-xl shadow-indigo-500/50">
        {tools.map((tool, index) => (
          <span
            className="bg-gradient-to-r from-pink-400 to-sky-600 bg-clip-text text-2xl text-transparent"
            key={index}>
            {tool}
          </span>
        ))}
      </div>
      <a
        className="text-4xl text-sky-600 underline transition-all delay-100 duration-200 ease-in hover:text-sky-400"
        href="https://github.com/kolyamba2105/webpack-template"
        rel="noreferrer"
        target="_blank">
        Webpack Template
      </a>
    </div>
  );
}
