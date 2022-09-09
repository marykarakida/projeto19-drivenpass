import jwt from 'jsonwebtoken';

import * as refreshTokenRepository from '../repositories/refreshTokenRepository';
import { CustomError } from '../middlewares/errorHandlerMiddleware';
import { IToken } from '../middlewares/validateTokenMiddleware';

export async function createRefreshToken(userId: string, refreshToken: string) {
    await refreshTokenRepository.insertRefreshToken({ userId, refreshToken });
}

export async function refreshSession(oldRefreshToken: string) {
    const currentRefreshToken = await refreshTokenRepository.findByRefreshToken(oldRefreshToken);

    if (!currentRefreshToken) {
        jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err, decoded) => {
            if (err) throw CustomError('error_forbidden', 'Cannot refresh session');

            await refreshTokenRepository.deleteRefreshTokens((decoded as IToken).id);
        });

        throw CustomError('error_forbidden', 'Cannot refresh session');
    }

    try {
        const payload = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET as string);

        if (currentRefreshToken.userId !== (payload as IToken).id) {
            throw CustomError('error_forbidden', '');
        }

        const accessToken = jwt.sign({ id: (payload as IToken).id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '30min' });
        const refreshToken = jwt.sign({ id: (payload as IToken).id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '1d' });

        await refreshTokenRepository.updateRefreshToken(currentRefreshToken.id, refreshToken);

        return { accessToken, refreshToken };
    } catch (err) {
        await refreshTokenRepository.deleteRefreshToken(currentRefreshToken.id);
        throw CustomError('error_forbidden', '');
    }
}
