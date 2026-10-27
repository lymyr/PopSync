interface props {
    content: string[];
    setContent: React.Dispatch<React.SetStateAction<string[]>>;
    attributes?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export default function AdaptiveTextArea({content, setContent, attributes}: props) {
    return (
        <textarea 
            style={{ resize: "none" }}
            wrap="soft"
            rows={content.length > 0 ? content.length : 1}
            onChange={(e) => {
                setContent(e.target.value.split(`\n`))
            }}
            value={content.join("\n")}
            {...attributes}
        />
    )
}