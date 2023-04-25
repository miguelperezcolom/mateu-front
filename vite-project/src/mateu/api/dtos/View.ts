import ViewPart from "./ViewPart";

export default interface View {

    title: string

    subtitle: string

    left: ViewPart

    main: ViewPart

    right: ViewPart

}
