import { button, useControls, useCreateStore } from 'leva'
import { ButtonInput } from 'leva/plugin'

export const useButtonGroupControls = (
    name: string,
    {
        options,
        current,
        onChange,
        hidden,
        store,
    }: {
        options: { name: string; value: string }[]
        current: string
        onChange: (value: string) => void
        hidden?: boolean
        store: ReturnType<typeof useCreateStore>
    }
) => {
    return useControls(
        name,
        () =>
            hidden
                ? {}
                : options.reduce<Record<string, ButtonInput>>((tools, t) => {
                      tools[t.name] = button(
                          () => {
                              onChange(t.value)
                          },
                          {
                              disabled: t.value === current,
                          }
                      )
                      return tools
                  }, {}),
        { store },
        [current, options, hidden, store]
    )
}
