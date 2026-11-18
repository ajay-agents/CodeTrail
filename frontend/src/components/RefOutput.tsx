export function RefOutput({ output, edited, langName, runtime }: { output: string; edited: boolean; langName: string; runtime: string }) {
  return (
    <div className="out">
      <span className="out-label">Output</span>
      <pre>{output.replace(/\n$/, '')}</pre>
      <p className="out-tip">
        {edited
          ? `You changed this code. Running edited ${langName} code needs a real ${runtime}, which isn't wired up yet. This is the output of the original example.`
          : `This is the output of this exact example, checked against a real ${runtime}. Live execution for ${langName} is on the roadmap.`}
      </p>
    </div>
  );
}
