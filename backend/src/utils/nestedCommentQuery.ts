const nestedCommentQuery = {
    select: {
        id: true,
        dateAdded: true,
        dateUpdated: true,
        content: true,
        replies: {
            select: {
                id: true,
                dateAdded: true,
                dateUpdated: true,
                content: true,
                replies: {
                    select: {
                        id: true,
                        dateAdded: true,
                        dateUpdated: true,
                        content: true,
                    }
                }
            }
        }
    }
}

export default nestedCommentQuery