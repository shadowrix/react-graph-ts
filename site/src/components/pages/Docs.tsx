import React from 'react'
import MarkdownPreview from '@uiw/react-markdown-preview'

import readme from '../../../../lib/README.md'
import { Block } from '../custom-ui/Block'

export function Docs() {
  const [content, setContent] = React.useState('')

  React.useEffect(() => {
    fetch(readme)
      .then((res) => res.text())
      .then((text) => setContent(text))
  }, [])

  return (
    <div className="w-full h-full flex justify-center">
      <Block className="w-[80%] h-full max-h-full overflow-auto">
        <MarkdownPreview source={content} className="p-10 rounded-2xl" />
      </Block>
    </div>
  )
}
