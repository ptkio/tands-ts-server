import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'
dotenv.config()
const fakedataPath = process.env.FAKEDATA_PATH as string
const userDir = path.join(fakedataPath, 'users')

type User = {
    id: number
    nom: string
    email: string
    age: number | undefined
    ville: string | undefined
    role: 'user' | 'admin'
}

const defaultUserValues = {
    id: 0,
    nom: '',
    email: '',
    age: undefined,
    ville: undefined,
    role: 'user',
}

/**
 * return users present in the directory (with recursive)
 * Can be filtered by user role
 * @param role
 */
const getUsersList = (role: string = ''): User[] => {
    return getUserInDirectory(path.join(userDir, role))
}

/**
 * return user object if exist
 */
const getUser = (id: number): User | null => {
    // récupération du chemin du fichier
    let filePath = getUserFilePath(id)
    if (filePath) {
        // si le fichier existe, récupération du contenu du fichier
        const user = getUserContent(filePath)
        if (user) {
            // si l'utilisateur a pu être généré, alors on le retourne
            return user
        }
    }
    return null
}

/**
 * Return users present in directory (with recursive)
 * @param directory
 */
const getUserInDirectory = (directory: string): User[] => {
    // liste des fichiers du répertoire
    const files = fs.readdirSync(directory)
    let users: User[] = []
    files.forEach((file) => {
        const filePath = path.join(directory, file)
        const stats = fs.statSync(filePath)
        if (!stats) {
            // si le fichier n'existe plus
            return
        }
        if (!stats.isDirectory()) {
            // si c'est pas un répertoire, on parse le contenu et ajoute l'utilisateur a la liste
            const user = getUserContent(filePath)
            if (user) {
                users.push(user)
            }
        } else {
            // si répertoire, on rappel la function avec le sous répertoire
            const subDirectoryUsers = getUserInDirectory(filePath)
            // puis on merge les résultats
            users = [...users, ...subDirectoryUsers]
        }
    })
    return users
}

/**
 * Get file content and merge with default values
 * @param filePath
 */
const getUserContent = (filePath: string): User | null => {
    let user = null

    try {
        let content = fs.readFileSync(filePath, 'utf8')
        const parsedUser = JSON.parse(content)
        user = { ...defaultUserValues, ...parsedUser } as User
    } catch (e) {}

    return user
}

/**
 * Get user file path by user id
 * @param id
 */
const getUserFilePath = (id: number): string | null => {
    let validFilePath: string | null = null
    // on parcours les roles à la recherche du fichier utilisateur (on commence par admin, il y en a logiquement moins)
    ;['admin', 'user'].forEach((role) => {
        if (validFilePath) {
            return
        }
        const filePath = path.join(userDir, role, id + '.json')
        try {
            if (fs.statSync(filePath)) {
                validFilePath = filePath
            }
        } catch (e) {}
    })
    return validFilePath
}

export { getUser, getUsersList }
