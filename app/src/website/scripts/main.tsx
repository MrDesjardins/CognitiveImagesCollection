import * as React from "react";

interface IMainProps {
    name: string;
}

export class MainComponent extends React.Component<IMainProps, {}> {
    public render(): JSX.Element {
        return <div>React: Hello1</div >;
    }
}