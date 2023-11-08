const BufferUtils = {
    updateBufferRange: (buffer, offset) => {
        const updateRange = buffer.updateRange;
        const stride = buffer.stride;
        if (updateRange.count === -1) {
            updateRange.offset = offset;
            updateRange.count = stride;
            return;
        }
    
        const prevOffset = updateRange.offset;
        const endOffset = prevOffset + updateRange.count;
        updateRange.offset = Math.min(prevOffset, offset);
        updateRange.count = Math.max(endOffset, offset + stride) - updateRange.offset;
    }
}

export { BufferUtils };